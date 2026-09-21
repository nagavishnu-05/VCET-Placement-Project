import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const exportAnalyticsPdf = async (
  element,
  fileName,
  { orientation = "portrait", stackCharts = false, singlePage = false } = {}
) => {
  if (!element) return;

  const pdf = new jsPDF(orientation, "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageMargin = 4;
  const contentWidth = pageWidth - pageMargin * 2;
  const contentHeight = pageHeight - pageMargin * 2;
  const sections = element.querySelectorAll(".analytics-card");
  let elementsToCapture = [element];
  if (!singlePage && sections.length > 0) {
    elementsToCapture = [...sections];
  }

  for (const [index, section] of elementsToCapture.entries()) {
    const canvas = await html2canvas(section, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      onclone: (clonedDocument) => {
        clonedDocument.querySelectorAll("button").forEach((button) => {
          button.style.display = "none";
        });
        if (stackCharts) {
          clonedDocument.querySelectorAll(".analytics-stats").forEach((stats) => {
            stats.style.flexDirection = "column";
          });
          clonedDocument.querySelectorAll(".chart-container").forEach((chart) => {
            chart.style.width = "100%";
          });
        }
      },
    });
    const imageScale = Math.min(
      contentWidth / canvas.width,
      contentHeight / canvas.height
    );
    const imageWidth = canvas.width * imageScale;
    const imageHeight = canvas.height * imageScale;
    const centeredImageX = (pageWidth - imageWidth) / 2;
    const centeredImageY = (pageHeight - imageHeight) / 2;

    if (index > 0) pdf.addPage();
    pdf.addImage(
      canvas,
      "PNG",
      centeredImageX,
      centeredImageY,
      imageWidth,
      imageHeight
    );
  }

  pdf.save(fileName);
};