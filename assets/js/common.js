$(document).ready(function () {
  var previewRefreshTimer;

  // Keep publication previews within 80%-100% of the corresponding entry height.
  function adjustPublicationPreview(image) {
    var $image = $(image);
    if (!$image.length) {
      return;
    }

    if (!image.naturalWidth || !image.naturalHeight) {
      return;
    }

    var $row = $image.closest(".row");
    if (!$row.length) {
      return;
    }

    var mainColumnEl = $row.find(".col-sm-9, .col-sm-10").get(0);
    if (!mainColumnEl) {
      return;
    }

    var entryHeight = mainColumnEl.getBoundingClientRect().height;
    if (!entryHeight) {
      return;
    }

    var minHeight = entryHeight * 0.8;
    var maxHeight = entryHeight;

    var columnEl = $image.closest(".col-sm-3").get(0);
    var columnWidth = columnEl
      ? columnEl.getBoundingClientRect().width
      : image.getBoundingClientRect().width;

    if (!columnWidth) {
      columnWidth = image.clientWidth || image.naturalWidth;
    }

    if (!columnWidth) {
      return;
    }

    var ratio = image.naturalHeight / image.naturalWidth;
    if (!ratio) {
      return;
    }

    var idealHeight = columnWidth * ratio;
    var targetHeight = idealHeight;

    if (idealHeight < minHeight) {
      targetHeight = minHeight;
    } else if (idealHeight > maxHeight) {
      targetHeight = maxHeight;
    }

    var widthForTarget = targetHeight / ratio;

    image.style.removeProperty("height");
    image.style.maxWidth = "100%";

    if (idealHeight >= minHeight && idealHeight <= maxHeight) {
      image.style.width = "100%";
      image.style.height = "auto";
      return;
    }

    if (widthForTarget <= columnWidth) {
      image.style.width = widthForTarget + "px";
      image.style.height = "auto";
      return;
    }

    image.style.width = "100%";
    image.style.height = targetHeight + "px";
  }

  function updatePublicationPreviews() {
    var previews = document.querySelectorAll(".publications img.preview");

    if (!previews.length) {
      return;
    }

    Array.prototype.forEach.call(previews, function (img) {
      if (!img) {
        return;
      }

      if (!img.complete || !img.naturalWidth || !img.naturalHeight) {
        var onLoad = function () {
          img.removeEventListener("load", onLoad);
          adjustPublicationPreview(img);
        };
        img.addEventListener("load", onLoad);
      }

      adjustPublicationPreview(img);
    });
  }

  function queuePreviewRefresh(delay) {
    var wait = typeof delay === "number" ? delay : 50;

    if (previewRefreshTimer) {
      window.clearTimeout(previewRefreshTimer);
    }

    previewRefreshTimer = window.setTimeout(updatePublicationPreviews, wait);
  }

  function refreshAfterToggle() {
    queuePreviewRefresh(0);
  }

  $("a.abstract").click(function () {
    var container = $(this).parent().parent();
    container.find(".abstract.hidden").toggleClass("open");
    container.find(".award.hidden.open").toggleClass("open");
    container.find(".bibtex.hidden.open").toggleClass("open");
    refreshAfterToggle();
  });
  $("a.award").click(function () {
    var container = $(this).parent().parent();
    container.find(".abstract.hidden.open").toggleClass("open");
    container.find(".award.hidden").toggleClass("open");
    container.find(".bibtex.hidden.open").toggleClass("open");
    refreshAfterToggle();
  });
  $("a.bibtex").click(function () {
    var container = $(this).parent().parent();
    container.find(".abstract.hidden.open").toggleClass("open");
    container.find(".award.hidden.open").toggleClass("open");
    container.find(".bibtex.hidden").toggleClass("open");
    refreshAfterToggle();
  });
  $("a").removeClass("waves-effect waves-light");

  if ($("#toc-sidebar").length) {
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });

  queuePreviewRefresh();

  $(window).on("load", updatePublicationPreviews);

  var resizeTimer;
  $(window).on("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(updatePublicationPreviews, 150);
  });
});
