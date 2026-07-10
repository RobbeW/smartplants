class LineBreakTransformer {
  constructor() {
    this.container = "";
  }

  transform(chunk, controller) {
    this.container += chunk;
    const lines = this.container.split(/\r?\n/);
    this.container = lines.pop();
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller) {
    if (this.container) controller.enqueue(this.container);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const DEFAULT_SERIAL_PROFILE = "arduino";
  const SERIAL_PROFILES = {
    arduino: {
      label: "Arduino",
      baudRate: 9600,
      connectedSummary: "Arduino verbonden.",
    },
    microbit: {
      label: "micro:bit",
      baudRate: 115200,
      connectedSummary: "micro:bit verbonden.",
    },
  };
  const MAX_LIVE_POINTS = 180;
  const DEMO_INTERVAL_MS = 1000;
  const ADC_MIN = 0;
  const ADC_MAX = 1023;
  const CHART_COLORS = {
    raw: "#5200FF",
    average: "#03ddef",
    dry: "#D0006F",
    moist: "#FFB000",
    wet: "#00A66A",
  };
  const CHART_FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
  const CHART_TEXT_COLOR = "#1d1930";
  const CHART_MUTED_COLOR = "#625b70";

  const els = {
    compatibilityNotice: $("compatibility-notice"),
    connectionStatus: $("connection-status"),
    workflowLinks: [...document.querySelectorAll("[data-step-link]")],
    workflowSections: [...document.querySelectorAll(".workflow-section")],
    stepPrevButtons: [...document.querySelectorAll("[data-step-prev]")],
    stepNextButtons: [...document.querySelectorAll("[data-step-next]")],
    stepCounters: [$("step-counter"), ...document.querySelectorAll("[data-step-counter-copy]")].filter(Boolean),
    setupChecklist: $("setup-checklist"),
    btnSchema: $("btn-schema"),
    btnCloseSchema: $("btn-close-schema"),
    overlaySchema: $("overlay-schema"),
    schemaZoomButtons: [...document.querySelectorAll("[data-schema-zoom]")],
    schemaImageViewer: $("schema-image-viewer"),
    btnCloseSchemaViewer: $("btn-close-schema-viewer"),
    schemaViewerImage: $("schema-viewer-image"),
    schemaViewerCaption: $("schema-viewer-caption"),
    btnHelp: $("btn-help"),
    btnCloseHelp: $("btn-close-help"),
    overlayHelp: $("overlay-help"),
    btnCodeHelp: $("btn-code-help"),
    btnCloseCodeHelp: $("btn-close-code-help"),
    codeHelpModal: $("code-help-modal"),
    btnConnect: $("btn-connect"),
    btnDemo: $("btn-demo"),
    serialProfile: $("serial-profile"),
    btnNewTrial: $("btn-new-trial"),
    btnStart: $("btn-start"),
    btnStop: $("btn-stop"),
    btnImportCsv: $("btn-import-csv"),
    inputImportCsv: $("input-import-csv"),
    btnCaptureDry: $("btn-capture-dry"),
    btnCaptureMoist: $("btn-capture-moist"),
    btnCaptureWet: $("btn-capture-wet"),
    btnExportCsv: $("btn-export-csv"),
    btnReport: $("btn-report"),
    btnCancel: $("btn-cancel"),
    reportModal: $("report-modal"),
    reportForm: $("report-form"),
    inputNames: $("input-names"),
    inputClass: $("input-class"),
    inputQuestion: $("input-question"),
    inputHypothesis: $("input-hypothesis"),
    inputIndependent: $("input-independent"),
    inputDependent: $("input-dependent"),
    inputControlled: $("input-controlled"),
    inputConclusion: $("input-conclusion"),
    inputReliability: $("input-reliability"),
    inputImprovement: $("input-improvement"),
    trialName: $("trial-name"),
    trialCondition: $("trial-condition"),
    trialWater: $("trial-water"),
    trialNote: $("trial-note"),
    metricRaw: $("metric-raw"),
    metricAverage: $("metric-average"),
    metricCategory: $("metric-category"),
    metricCategoryNote: $("metric-category-note"),
    metricOutput: $("metric-output"),
    metricOutputNote: $("metric-output-note"),
    calibrationDry: $("calibration-dry"),
    calibrationMoist: $("calibration-moist"),
    calibrationWet: $("calibration-wet"),
    calibrationDirection: $("calibration-direction"),
    thresholdDry: $("threshold-dry"),
    thresholdWet: $("threshold-wet"),
    calibrationQualityPanel: $("calibration-quality-panel"),
    calibrationQualityStatus: $("calibration-quality-status"),
    calibrationQualityDetail: $("calibration-quality-detail"),
    calibrationQualityGap: $("calibration-quality-gap"),
    diagnosticSummary: $("diagnostic-summary"),
    diagnosticList: $("diagnostic-list"),
    serialPreview: $("serial-preview"),
    trialSummaryBody: $("trial-summary-body"),
    sampleBody: $("sample-body"),
    liveChartCanvas: $("live-chart"),
    liveChartLargeCanvas: $("live-chart-large"),
    btnExpandLiveChart: $("btn-expand-live-chart"),
    btnCloseLiveChart: $("btn-close-live-chart"),
    liveChartModal: $("live-chart-modal"),
    comparisonChartCanvas: $("comparison-chart"),
  };

  const state = {
    port: null,
    reader: null,
    serialLoopActive: false,
    source: null,
    serialLabel: SERIAL_PROFILES[DEFAULT_SERIAL_PROFILE].label,
    serialBaudRate: SERIAL_PROFILES[DEFAULT_SERIAL_PROFILE].baudRate,
    demoTimer: null,
    demoMs: 0,
    droppedLines: 0,
    isMeasuring: false,
    latestReading: null,
    recentReadings: [],
    trials: [],
    activeTrial: null,
    currentStepIndex: 0,
    calibration: {
      dry: null,
      moist: null,
      wet: null,
      direction: "unknown",
      dryThreshold: null,
      wetThreshold: null,
      quality: {
        status: "Nog niet genoeg data",
        level: "pending",
        detail: "Meet eerst droge en natte bodem met dezelfde sensorpositie. Licht vochtig is de controle.",
        smallestGap: null,
      },
    },
    liveChart: null,
    largeLiveChart: null,
    comparisonChart: null,
  };

  initialize();

  function initialize() {
    document.body.classList.add("workflow-ready");
    updateCompatibilityNotice();
    createCharts();
    bindEvents();
    createNewTrial({ resetForm: true });
    showWorkflowStep(0, { scroll: false });
    updateCalibrationDisplay();
    updateLiveDisplay(null);
    updateDiagnostics("Nog geen meetwaarden.", [
      "Verbind Arduino of micro:bit, laad een CSV-bestand of start de demomodus.",
      "Het bord stuurt per regel: tijd_ms,raw of tijd_ms,raw,average,category_code.",
      "Regels die starten met # tonen we als statusmelding.",
    ]);
    updateControls();
    updateWorkflowState();
  }

  function on(element, eventName, handler) {
    if (element) element.addEventListener(eventName, handler);
  }

  function selectedSerialProfile() {
    const key = (els.serialProfile && els.serialProfile.value) || DEFAULT_SERIAL_PROFILE;
    return SERIAL_PROFILES[key] || SERIAL_PROFILES[DEFAULT_SERIAL_PROFILE];
  }

  function detectSerialProfile(port) {
    if (!port || typeof port.getInfo !== "function") return null;
    const info = port.getInfo();
    const vendorId = Number(info.usbVendorId);
    const productId = Number(info.usbProductId);

    const microbitVendors = [0x0d28];
    const arduinoVendors = [0x2341, 0x2a03, 0x1a86, 0x0403, 0x10c4, 0x239a];

    if (microbitVendors.includes(vendorId)) {
      return { key: "microbit", profile: SERIAL_PROFILES.microbit, info: usbInfoLabel(vendorId, productId) };
    }
    if (arduinoVendors.includes(vendorId)) {
      return { key: "arduino", profile: SERIAL_PROFILES.arduino, info: usbInfoLabel(vendorId, productId) };
    }
    return { key: null, profile: null, info: usbInfoLabel(vendorId, productId) };
  }

  function usbInfoLabel(vendorId, productId) {
    if (!Number.isFinite(vendorId)) return "";
    const vendor = vendorId.toString(16).padStart(4, "0").toUpperCase();
    const product = Number.isFinite(productId) ? productId.toString(16).padStart(4, "0").toUpperCase() : "????";
    return `USB ${vendor}:${product}`;
  }

  function connectedStatusText() {
    return `Verbonden (${state.serialLabel}, ${state.serialBaudRate} baud)`;
  }

  function measuringStatusText() {
    return `Meten (${state.serialLabel}, ${state.serialBaudRate} baud)`;
  }

  function sourceLabel(source) {
    const labels = {
      demo: "demomodus",
      import: "CSV-bestand",
      serial: state.serialLabel || "bord",
    };
    return labels[source] || source || "onbekende bron";
  }

  function workflowIndexForId(id) {
    return els.workflowSections.findIndex((section) => section.id === id);
  }

  function bindEvents() {
    on(els.btnConnect, "click", connectSerial);
    on(els.btnDemo, "click", toggleDemo);
    on(els.btnNewTrial, "click", () => createNewTrial({ resetForm: true }));
    on(els.btnStart, "click", startMeasurement);
    on(els.btnStop, "click", stopMeasurement);
    on(els.btnImportCsv, "click", () => {
      if (els.inputImportCsv) els.inputImportCsv.click();
    });
    on(els.inputImportCsv, "change", importCsvFile);
    on(els.btnCaptureDry, "click", () => captureCalibration("dry"));
    on(els.btnCaptureMoist, "click", () => captureCalibration("moist"));
    on(els.btnCaptureWet, "click", () => captureCalibration("wet"));
    on(els.btnExportCsv, "click", exportCsv);
    on(els.btnReport, "click", () => openOverlay(els.reportModal));
    on(els.btnCancel, "click", () => closeOverlay(els.reportModal));
    on(els.reportForm, "submit", (event) => {
      event.preventDefault();
      generatePdfReport();
    });
    on(els.btnSchema, "click", () => openOverlay(els.overlaySchema));
    on(els.btnCloseSchema, "click", () => closeOverlay(els.overlaySchema));
    on(els.btnCloseSchemaViewer, "click", () => closeOverlay(els.schemaImageViewer));
    els.schemaZoomButtons.forEach((button) => {
      button.addEventListener("click", () => openSchemaImageViewer(button));
    });
    on(els.btnExpandLiveChart, "click", openLiveChartModal);
    on(els.btnCloseLiveChart, "click", () => closeOverlay(els.liveChartModal));
    on(els.btnHelp, "click", () => openOverlay(els.overlayHelp));
    on(els.btnCloseHelp, "click", () => closeOverlay(els.overlayHelp));
    on(els.btnCodeHelp, "click", () => openOverlay(els.codeHelpModal));
    on(els.btnCloseCodeHelp, "click", () => closeOverlay(els.codeHelpModal));

    els.workflowLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const index = workflowIndexForId(link.dataset.stepLink);
        if (index >= 0) showWorkflowStep(index);
      });
    });
    els.stepPrevButtons.forEach((button) => {
      button.addEventListener("click", () => showWorkflowStep(state.currentStepIndex - 1));
    });
    els.stepNextButtons.forEach((button) => {
      button.addEventListener("click", () => showWorkflowStep(state.currentStepIndex + 1));
    });

    document.querySelectorAll(".overlay").forEach((overlay) => {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeOverlay(overlay);
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") document.querySelectorAll(".overlay").forEach(closeOverlay);
    });

    [
      els.inputQuestion,
      els.inputHypothesis,
      els.inputIndependent,
      els.inputDependent,
      els.inputControlled,
      els.trialName,
      els.trialCondition,
      els.trialWater,
      els.trialNote,
      els.inputConclusion,
      els.inputReliability,
      els.inputImprovement,
    ].forEach((input) => on(input, "input", () => {
      syncActiveTrialFromForm();
      updateComparisonChart();
      renderTrialSummaries();
      updateWorkflowState();
    }));
  }

  function updateCompatibilityNotice() {
    const messages = [];
    if (!window.isSecureContext) {
      messages.push("WebSerial werkt alleen via HTTPS, GitHub Pages of localhost.");
    }
    if (!("serial" in navigator)) {
      messages.push("Deze browser ondersteunt WebSerial niet. Gebruik Chrome of Edge, of werk met de demomodus.");
    }
    if (!window.Chart || !window.jspdf) {
      messages.push("Een lokale vendor-bibliotheek ontbreekt. Controleer de map vendor/.");
    }
    if (messages.length && els.compatibilityNotice) {
      els.compatibilityNotice.classList.remove("hidden");
      els.compatibilityNotice.innerHTML = messages.map((message) => `<p>${escapeHtml(message)}</p>`).join("");
    }
  }

  function createCharts() {
    if (!window.Chart) return;

    state.liveChart = createLiveChart(els.liveChartCanvas);
    state.comparisonChart = new Chart(els.comparisonChartCanvas, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Gemiddelde sensorwaarde",
            data: [],
            backgroundColor: CHART_COLORS.raw,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        devicePixelRatio: chartDevicePixelRatio(),
        plugins: {
          legend: {
            labels: chartLabelStyle(),
          },
          tooltip: {
            titleFont: chartFont(14, 850),
            bodyFont: chartFont(13, 700),
          },
        },
        scales: {
          x: {
            ticks: { color: CHART_MUTED_COLOR, font: chartFont(12, 700) },
          },
          y: {
            min: 0,
            max: 1023,
            title: { display: true, text: "Sensorwaarde (0-1023)", color: CHART_TEXT_COLOR, font: chartFont(13, 800) },
            ticks: { color: CHART_MUTED_COLOR, font: chartFont(12, 700) },
            grid: { color: "rgba(98, 91, 112, 0.16)" },
          },
        },
      },
    });
  }

  function createLiveChart(canvas, variant = "normal") {
    if (!canvas) return null;
    const isLarge = variant === "large";
    return new Chart(canvas, {
      type: "line",
      data: {
        labels: [],
        datasets: liveChartDatasets(isLarge),
      },
      options: liveChartOptions(isLarge),
    });
  }

  function liveChartDatasets(isLarge = false) {
    return [
      {
        label: "Ruwe sensorwaarde",
        data: [],
        borderColor: CHART_COLORS.raw,
        backgroundColor: CHART_COLORS.raw,
        borderWidth: isLarge ? 3 : 2.4,
        tension: 0.25,
        pointRadius: 0,
        pointHitRadius: isLarge ? 18 : 14,
        pointHoverRadius: isLarge ? 6 : 5,
      },
      {
        label: "Score (gemiddelde)",
        data: [],
        borderColor: CHART_COLORS.average,
        backgroundColor: CHART_COLORS.average,
        borderWidth: isLarge ? 3 : 2.4,
        tension: 0.25,
        pointRadius: 0,
        pointHitRadius: isLarge ? 18 : 14,
        pointHoverRadius: isLarge ? 6 : 5,
      },
    ];
  }

  function liveChartOptions(isLarge = false) {
    const tickSize = isLarge ? 14 : 12;
    const titleSize = isLarge ? 15 : 13;
    return {
      responsive: true,
      animation: false,
      maintainAspectRatio: false,
      devicePixelRatio: chartDevicePixelRatio(),
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          labels: chartLabelStyle(isLarge),
        },
        tooltip: {
          displayColors: true,
          titleFont: chartFont(isLarge ? 15 : 14, 850),
          bodyFont: chartFont(isLarge ? 14 : 13, 700),
          callbacks: {
            title() {
              return "Meetpunt";
            },
            label(context) {
              const sample = liveChartSampleAt(context.dataIndex);
              const score = sample?.average ?? context.parsed?.y;
              return `Score: ${formatOptional(score, 0)}`;
            },
            afterBody(items) {
              const sample = liveChartSampleAt(items[0]?.dataIndex);
              if (!sample) return [];
              return [`Bepaling: ${sample.category || categorizeReading(sample.average)}`];
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Tijd sinds start (s)", color: CHART_TEXT_COLOR, font: chartFont(titleSize, 800) },
          ticks: { color: CHART_MUTED_COLOR, font: chartFont(tickSize, 700), maxRotation: 0 },
          grid: { color: "rgba(98, 91, 112, 0.14)" },
        },
        y: {
          min: 0,
          max: 1023,
          title: { display: true, text: "Sensorwaarde (0-1023)", color: CHART_TEXT_COLOR, font: chartFont(titleSize, 800) },
          ticks: { color: CHART_MUTED_COLOR, font: chartFont(tickSize, 700) },
          grid: { color: "rgba(98, 91, 112, 0.16)" },
        },
      },
    };
  }

  function chartLabelStyle(isLarge = false) {
    return {
      color: CHART_TEXT_COLOR,
      boxWidth: isLarge ? 18 : 15,
      boxHeight: isLarge ? 4 : 3,
      padding: isLarge ? 18 : 14,
      usePointStyle: false,
      font: chartFont(isLarge ? 14 : 13, 850),
    };
  }

  function chartFont(size, weight = 700) {
    return {
      family: CHART_FONT_FAMILY,
      size,
      weight,
    };
  }

  function chartDevicePixelRatio() {
    return Math.max(window.devicePixelRatio || 1, 2);
  }

  async function connectSerial() {
    if (!("serial" in navigator)) {
      alert("WebSerial is niet beschikbaar in deze browser. Gebruik Chrome of Edge, of start de demomodus.");
      return;
    }
    let profile = selectedSerialProfile();
    let detectionMessage = "Bordtype handmatig gekozen.";
    try {
      stopDemo();
      state.port = await navigator.serial.requestPort();
      const detected = detectSerialProfile(state.port);
      if (detected && detected.profile) {
        profile = detected.profile;
        detectionMessage = `Bordtype automatisch herkend: ${profile.label}${detected.info ? ` (${detected.info})` : ""}.`;
        if (els.serialProfile) els.serialProfile.value = detected.key;
      } else if (detected && detected.info) {
        detectionMessage = `Bordtype niet zeker (${detected.info}). Dropdown gebruikt als fallback.`;
      }
      await state.port.open({ baudRate: profile.baudRate });
      const decoder = new TextDecoderStream();
      state.port.readable.pipeTo(decoder.writable).catch(() => {});
      state.reader = decoder.readable
        .pipeThrough(new TransformStream(new LineBreakTransformer()))
        .getReader();
      state.source = "serial";
      state.serialLabel = profile.label;
      state.serialBaudRate = profile.baudRate;
      els.connectionStatus.textContent = connectedStatusText();
      updateDiagnostics(profile.connectedSummary, [
        detectionMessage,
        "Wacht op meetregels met tijd_ms,raw.",
        "De kalibratie gebeurt in het platform.",
      ]);
      readSerialLoop();
      updateControls();
    } catch (error) {
      updateDiagnostics(`${profile.label} verbinden mislukt.`, [error.message || String(error)]);
    }
  }

  async function readSerialLoop() {
    if (state.serialLoopActive || !state.reader) return;
    state.serialLoopActive = true;
    try {
      while (true) {
        const { value, done } = await state.reader.read();
        if (done) break;
        if (typeof value === "string") parseSerialLine(value, "serial");
      }
    } catch (error) {
      updateDiagnostics("Seriele verbinding onderbroken.", [error.message || String(error)]);
    } finally {
      state.serialLoopActive = false;
    }
  }

  function parseSerialLine(line, source) {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (els.serialPreview) els.serialPreview.textContent = `Laatste regel: ${trimmed}`;

    if (trimmed.startsWith("#")) {
      handleStatusLine(trimmed);
      return;
    }

    const values = trimmed.split(",").map((part) => Number(part.trim().replace(",", ".")));
    if (![2, 4].includes(values.length) || values.some((value) => !Number.isFinite(value))) {
      state.droppedLines += 1;
      updateDiagnostics("Meetregel overgeslagen.", [
        `Ontvangen velden: ${values.length}. Verwacht 2 of 4 numerieke velden.`,
        "Verwacht formaat: tijd_ms,raw of tijd_ms,raw,average,category_code.",
      ]);
      return;
    }

    const reading = {
      deviceMs: Math.max(0, values[0]),
      raw: clamp(values[1], ADC_MIN, ADC_MAX),
      average: values.length === 4 ? clamp(values[2], ADC_MIN, ADC_MAX) : clamp(values[1], ADC_MIN, ADC_MAX),
      firmwareCategory: values.length === 4 ? Math.round(values[3]) : 0,
      source,
      rawLine: trimmed,
    };
    handleReading(reading);
  }

  function handleStatusLine(line) {
    const message = line.replace(/^#\s*/, "");
    const isError = /fout|error|niet|fail/i.test(message);
    updateDiagnostics(message, [
      isError
        ? "Controleer USB, GND, voeding, analoge pin en of de juiste projectcode op het bord staat."
        : "Status van het bord ontvangen. Wacht op meetwaarden of start een meting.",
    ]);
  }

  function toggleDemo() {
    if (state.demoTimer) {
      stopDemo();
      return;
    }
    state.source = "demo";
    state.demoMs = 0;
    els.btnDemo.textContent = "Stop demomodus";
    els.connectionStatus.textContent = "Demomodus actief";
    updateDiagnostics("Demomodus gestart.", [
      "De demo maakt voorbeeldwaarden voor droge, vochtige en natte bodem.",
      "Gebruik dit om kalibratie en rapportage zonder hardware te oefenen.",
    ]);
    handleReading(makeDemoReading());
    state.demoTimer = window.setInterval(() => handleReading(makeDemoReading()), DEMO_INTERVAL_MS);
    updateControls();
  }

  function stopDemo() {
    if (!state.demoTimer) return;
    window.clearInterval(state.demoTimer);
    state.demoTimer = null;
    if (state.source === "demo") state.source = state.reader ? "serial" : null;
    els.btnDemo.textContent = "Start demomodus";
    els.connectionStatus.textContent = state.reader ? connectedStatusText() : "Niet verbonden";
    updateDiagnostics("Demomodus gestopt.", ["Verbind Arduino of micro:bit, importeer een CSV-bestand of start opnieuw de demomodus."]);
    updateControls();
  }

  function makeDemoReading() {
    state.demoMs += DEMO_INTERVAL_MS;
    const condition = String((els.trialCondition && els.trialCondition.value) || "").toLowerCase();
    const water = Number((els.trialWater && els.trialWater.value) || 0);
    const isWetCondition = /(^|\s)nat(te)?(\s|$)/.test(condition);
    let base = 680;
    if (condition.includes("vochtig") || (water >= 15 && water < 35)) base = 500;
    if (isWetCondition || water >= 35) base = 330;
    if (condition.includes("plant a")) base = 570;
    if (condition.includes("plant b")) base = 430;
    const drift = 22 * Math.sin(state.demoMs / 5000);
    const noise = (Math.random() - 0.5) * 34;
    const average = clamp(base + drift + noise, ADC_MIN, ADC_MAX);
    return {
      deviceMs: state.demoMs,
      raw: Math.round(clamp(average + (Math.random() - 0.5) * 24, ADC_MIN, ADC_MAX)),
      average: Math.round(average),
      firmwareCategory: 0,
      source: "demo",
      rawLine: `${state.demoMs},demo`,
    };
  }

  function handleReading(reading) {
    state.latestReading = {
      ...reading,
      category: categorizeReading(reading.average),
    };
    state.recentReadings.push(state.latestReading);
    state.recentReadings = state.recentReadings.slice(-20);

    if (state.isMeasuring) addSampleToActiveTrial(state.latestReading);

    updateLiveDisplay(state.latestReading);
    renderSampleTable();
    renderTrialSummaries();
    updateCharts();
    updateControls();
    updateWorkflowState();

    if (!state.isMeasuring) {
      updateDiagnostics(`Meetwaarde ontvangen via ${sourceLabel(reading.source)}.`, [
        "Kalibreer of start een meetreeks.",
        state.droppedLines ? `${state.droppedLines} meetregels werden overgeslagen.` : "De meetregel is verwerkt.",
      ]);
    }
  }

  function captureCalibration(kind) {
    if (!state.latestReading) {
      alert("Er is nog geen meetwaarde. Verbind Arduino of micro:bit, start de demomodus of importeer een CSV-bestand.");
      return;
    }
    const readings = state.recentReadings.slice(-3);
    const values = readings.length ? readings.map((reading) => reading.average) : [state.latestReading.average];
    state.calibration[kind] = Math.round(average(values));
    updateCalibrationThresholds();
    recategorizeStoredSamples();
    updateCalibrationDisplay();
    updateLiveDisplay(state.latestReading);
    renderSampleTable();
    renderTrialSummaries();
    updateCharts();
    const quality = state.calibration.quality || evaluateCalibrationQuality();
    const countLabel = values.length === 1 ? "meting" : "metingen";
    updateDiagnostics("Kalibratiemeting opgeslagen.", [
      `${labelForCalibration(kind)}: gemiddelde van ${values.length} ${countLabel} = ${state.calibration[kind]}.`,
      thresholdsReady() ? `Kwaliteit van de kalibratie: ${quality.status}.` : "Gebruik telkens dezelfde sensorpositie en wachttijd.",
    ]);
    updateWorkflowState();
  }

  function updateCalibrationThresholds() {
    const { dry, moist, wet } = state.calibration;
    if (![dry, wet].every(Number.isFinite)) {
      state.calibration.direction = "unknown";
      state.calibration.dryThreshold = null;
      state.calibration.wetThreshold = null;
      state.calibration.quality = evaluateCalibrationQuality();
      return;
    }

    state.calibration.direction = wet > dry ? "higher_is_wetter" : "lower_is_wetter";
    if (Number.isFinite(moist)) {
      state.calibration.dryThreshold = Math.round((dry + moist) / 2);
      state.calibration.wetThreshold = Math.round((moist + wet) / 2);
    } else {
      state.calibration.dryThreshold = Math.round((2 * dry + wet) / 3);
      state.calibration.wetThreshold = Math.round((dry + 2 * wet) / 3);
    }
    state.calibration.quality = evaluateCalibrationQuality();
  }

  function updateCalibrationDisplay() {
    els.calibrationDry.textContent = formatOptional(state.calibration.dry, 0);
    els.calibrationMoist.textContent = formatOptional(state.calibration.moist, 0);
    els.calibrationWet.textContent = formatOptional(state.calibration.wet, 0);
    els.thresholdDry.textContent = formatOptional(state.calibration.dryThreshold, 0);
    els.thresholdWet.textContent = formatOptional(state.calibration.wetThreshold, 0);
    els.calibrationDirection.textContent = directionLabel();
    updateCalibrationQualityDisplay();
  }

  function evaluateCalibrationQuality() {
    const { dry, moist, wet } = state.calibration;
    if (![dry, wet].every(Number.isFinite)) {
      return {
        status: "Nog niet genoeg data",
        level: "pending",
        detail: "Meet eerst droge en natte bodem met dezelfde sensorpositie. Licht vochtig is de controle.",
        smallestGap: null,
      };
    }

    const direction = wet > dry ? "higher_is_wetter" : "lower_is_wetter";
    const dryWetGap = Math.abs(dry - wet);
    if (!Number.isFinite(moist)) {
      if (dryWetGap >= 150) {
        return {
          status: "Sneltest goed",
          level: "good",
          detail: "Droog en nat liggen duidelijk uit elkaar. Meet licht vochtig als controle voor de middenzone.",
          smallestGap: dryWetGap,
          dryWetGap,
        };
      }

      if (dryWetGap >= 90) {
        return {
          status: "Sneltest",
          level: "caution",
          detail: "Droog en nat verschillen genoeg om te starten. Meet licht vochtig als je meer zekerheid wilt.",
          smallestGap: dryWetGap,
          dryWetGap,
        };
      }

      return {
        status: "Hermeet",
        level: "remeasure",
        detail: "Droog en nat liggen te dicht bij elkaar. Meet opnieuw met duidelijk drogere en nattere bodem.",
        smallestGap: dryWetGap,
        dryWetGap,
      };
    }

    const moistBetween = direction === "higher_is_wetter"
      ? dry < moist && moist < wet
      : dry > moist && moist > wet;
    const dryMoistGap = Math.abs(dry - moist);
    const moistWetGap = Math.abs(moist - wet);
    const smallestGap = Math.min(dryMoistGap, moistWetGap);

    if (!moistBetween) {
      return {
        status: "Hermeet",
        level: "remeasure",
        detail: "De meting voor licht vochtig ligt niet tussen droog en nat. Controleer sensorpositie, wachttijd en bodemmonsters.",
        smallestGap,
        dryWetGap,
      };
    }

    if (smallestGap >= 50) {
      return {
        status: "Goed",
        level: "good",
        detail: "De drie punten liggen duidelijk uit elkaar. Houd dezelfde sensorpositie aan bij elke meetreeks.",
        smallestGap,
        dryWetGap,
      };
    }

    if (smallestGap >= 25) {
      return {
        status: "Twijfelachtig",
        level: "caution",
        detail: "De verschillen zijn klein. Neem extra metingen en wacht telkens even lang na het toevoegen van water.",
        smallestGap,
        dryWetGap,
      };
    }

    return {
      status: "Hermeet",
      level: "remeasure",
      detail: "De punten liggen te dicht bij elkaar. Meet opnieuw met duidelijk drogere en nattere bodem.",
      smallestGap,
      dryWetGap,
    };
  }

  function updateCalibrationQualityDisplay() {
    const quality = state.calibration.quality || evaluateCalibrationQuality();
    if (els.calibrationQualityStatus) els.calibrationQualityStatus.textContent = quality.status;
    if (els.calibrationQualityDetail) els.calibrationQualityDetail.textContent = quality.detail;
    if (els.calibrationQualityGap) {
      const hasMoistCheck = Number.isFinite(state.calibration.moist);
      const gapLabel = hasMoistCheck ? "Kleinste verschil" : "Verschil droog/nat";
      els.calibrationQualityGap.textContent = Number.isFinite(quality.smallestGap)
        ? `${gapLabel}: ${quality.smallestGap.toFixed(0)} ADC-punten`
        : `${gapLabel}: --`;
    }
    if (els.calibrationQualityPanel) {
      els.calibrationQualityPanel.classList.remove("is-pending", "is-good", "is-caution", "is-remeasure");
      const className = {
        pending: "is-pending",
        good: "is-good",
        caution: "is-caution",
        remeasure: "is-remeasure",
      }[quality.level] || "is-pending";
      els.calibrationQualityPanel.classList.add(className);
    }
  }

  function categorizeReading(value) {
    const calibration = state.calibration;
    if (!Number.isFinite(value) || !thresholdsReady()) return "Onbekend";
    if (calibration.direction === "lower_is_wetter") {
      if (value > calibration.dryThreshold) return "Droog";
      if (value <= calibration.wetThreshold) return "Nat";
      return "Vochtig";
    }
    if (value < calibration.dryThreshold) return "Droog";
    if (value >= calibration.wetThreshold) return "Nat";
    return "Vochtig";
  }

  function startMeasurement() {
    if (!state.source) {
      alert("Verbind eerst Arduino of micro:bit, of start de demomodus.");
      return;
    }
    const trial = ensureActiveTrial();
    resetTrialData(trial);
    syncActiveTrialFromForm();
    state.isMeasuring = true;
    els.connectionStatus.textContent = state.source === "demo" ? "Demomodus meet" : measuringStatusText();
    updateDiagnostics(`Meting gestart voor ${trial.name}.`, [
      "Meet lang genoeg om verschillen te zien.",
      "Verander tijdens een meetreeks maar een factor tegelijk.",
    ]);
    updateControls();
    updateWorkflowState();
  }

  function stopMeasurement() {
    if (!state.isMeasuring) return;
    state.isMeasuring = false;
    const trial = ensureActiveTrial();
    trial.endedAt = new Date();
    trial.summary = summarizeTrial(trial);
    els.connectionStatus.textContent = state.source === "demo" ? "Demomodus actief" : state.source ? connectedStatusText() : "Niet verbonden";
    updateDiagnostics(`Meting gestopt voor ${trial.name}.`, [
      trial.samples.length ? `${trial.samples.length} meetpunten opgeslagen.` : "Er werden geen meetpunten opgeslagen.",
    ]);
    renderTrialSummaries();
    updateComparisonChart();
    updateControls();
    updateWorkflowState();
  }

  function addSampleToActiveTrial(reading) {
    const trial = ensureActiveTrial();
    if (trial.startDeviceMs === null) {
      trial.startDeviceMs = reading.deviceMs;
      trial.lastDeviceMs = reading.deviceMs;
      trial.startedAt = new Date();
    }

    let elapsedMs = reading.deviceMs - trial.startDeviceMs;
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
      trial.startDeviceMs = reading.deviceMs;
      elapsedMs = 0;
      updateDiagnostics("Tijdstempel reset gedetecteerd.", [
        "De bordtijd sprong terug. Deze meetreeks wordt vanaf dit punt opnieuw getimed.",
      ]);
    }
    trial.lastDeviceMs = reading.deviceMs;

    trial.samples.push({
      deviceMs: reading.deviceMs,
      elapsedMs,
      raw: reading.raw,
      average: reading.average,
      category: categorizeReading(reading.average),
      source: reading.source,
    });
    trial.summary = summarizeTrial(trial);
  }

  function createNewTrial({ resetForm } = {}) {
    const index = state.trials.length + 1;
    const trial = {
      id: `trial-${Date.now()}-${Math.round(Math.random() * 10000)}`,
      index,
      name: `Meting ${index}`,
      condition: resetForm ? defaultConditionForIndex(index) : (els.trialCondition && els.trialCondition.value) || "Droog",
      waterMl: resetForm ? defaultWaterForIndex(index) : Number((els.trialWater && els.trialWater.value) || 0),
      note: "",
      samples: [],
      startDeviceMs: null,
      lastDeviceMs: null,
      startedAt: null,
      endedAt: null,
      summary: null,
    };
    state.trials.push(trial);
    state.activeTrial = trial;
    if (resetForm) {
      applyTrialToForm(trial);
    }
    renderTrialSummaries();
    updateComparisonChart();
    updateWorkflowState();
  }

  function ensureActiveTrial() {
    if (!state.activeTrial) createNewTrial({ resetForm: true });
    return state.activeTrial;
  }

  function resetTrialData(trial) {
    trial.samples = [];
    trial.startDeviceMs = null;
    trial.lastDeviceMs = null;
    trial.startedAt = null;
    trial.endedAt = null;
    trial.summary = null;
  }

  function syncActiveTrialFromForm() {
    const trial = ensureActiveTrial();
    trial.name = els.trialName.value.trim() || `Meting ${trial.index}`;
    trial.condition = els.trialCondition.value;
    trial.waterMl = Number(els.trialWater.value || 0);
    trial.note = els.trialNote.value.trim();
  }

  function applyTrialToForm(trial) {
    if (!trial) return;
    ensureConditionOption(trial.condition);
    els.trialName.value = trial.name;
    els.trialCondition.value = trial.condition;
    els.trialWater.value = String(Number.isFinite(trial.waterMl) ? trial.waterMl : 0);
    els.trialNote.value = trial.note || "";
  }

  function ensureConditionOption(value) {
    if (!els.trialCondition || !value) return;
    const exists = [...els.trialCondition.options].some((option) => option.value === value);
    if (exists) return;
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    els.trialCondition.appendChild(option);
  }

  function recategorizeStoredSamples() {
    state.trials.forEach((trial) => {
      trial.samples.forEach((sample) => {
        sample.category = categorizeReading(sample.average);
      });
      trial.summary = summarizeTrial(trial);
    });
    state.recentReadings.forEach((reading) => {
      reading.category = categorizeReading(reading.average);
    });
    if (state.latestReading) {
      state.latestReading.category = categorizeReading(state.latestReading.average);
    }
  }

  function updateLiveDisplay(reading) {
    if (!reading) {
      els.metricRaw.textContent = "--";
      els.metricAverage.textContent = "--";
      els.metricCategory.textContent = "Onbekend";
      els.metricCategoryNote.textContent = "Kalibreer eerst.";
      els.metricOutput.textContent = "--";
      els.metricOutputNote.textContent = "Nog geen drempel.";
      return;
    }
    const category = categorizeReading(reading.average);
    els.metricRaw.textContent = formatNumber(reading.raw, 0);
    els.metricAverage.textContent = formatNumber(reading.average, 0);
    els.metricCategory.textContent = category;
    els.metricCategoryNote.textContent = thresholdsReady() ? "Op basis van eigen kalibratie." : "Nog geen volledige kalibratie.";

    if (category === "Droog") {
      els.metricOutput.textContent = "Waarschuw";
      els.metricOutputNote.textContent = "Bijvoorbeeld: rode led.";
    } else if (category === "Vochtig") {
      els.metricOutput.textContent = "OK";
      els.metricOutputNote.textContent = "Bijvoorbeeld: groene led.";
    } else if (category === "Nat") {
      els.metricOutput.textContent = "Te nat";
      els.metricOutputNote.textContent = "Bijvoorbeeld: controleer de plant nog eens.";
    } else {
      els.metricOutput.textContent = "--";
      els.metricOutputNote.textContent = "Kalibreer eerst.";
    }
  }

  function renderSampleTable() {
    const rows = state.activeTrial ? state.activeTrial.samples.slice(-8).reverse() : [];
    if (!rows.length) {
      els.sampleBody.innerHTML = '<tr><td colspan="4">Nog geen data.</td></tr>';
      return;
    }
    els.sampleBody.innerHTML = rows.map((sample) => `
      <tr>
        <td>${(sample.elapsedMs / 1000).toFixed(0)} s</td>
        <td>${formatNumber(sample.raw, 0)}</td>
        <td>${formatNumber(sample.average, 0)}</td>
        <td>${escapeHtml(sample.category)}</td>
      </tr>
    `).join("");
  }

  function renderTrialSummaries() {
    const measured = trialsWithData();
    if (!measured.length) {
      els.trialSummaryBody.innerHTML = '<tr><td colspan="7">Nog geen meetreeksen opgeslagen.</td></tr>';
      return;
    }
    els.trialSummaryBody.innerHTML = measured.map((trial) => {
      const summary = summarizeTrial(trial);
      return `
        <tr>
          <td>${escapeHtml(trial.name)}</td>
          <td>${escapeHtml(trial.condition)}</td>
          <td>${Number.isFinite(trial.waterMl) ? `${trial.waterMl} ml` : "-"}</td>
          <td>${formatDuration(summary.durationMs)}</td>
          <td>${formatNumber(summary.avgAverage, 0)}</td>
          <td>${formatNumber(summary.minAverage, 0)}</td>
          <td>${formatNumber(summary.maxAverage, 0)}</td>
        </tr>
      `;
    }).join("");
  }

  function updateCharts() {
    updateLiveChart();
    updateComparisonChart();
  }

  function liveChartRows() {
    return state.activeTrial ? state.activeTrial.samples.slice(-MAX_LIVE_POINTS) : [];
  }

  function liveChartSampleAt(index) {
    if (!Number.isInteger(index) || index < 0) return null;
    return liveChartRows()[index] || null;
  }

  function updateLiveChart() {
    const rows = liveChartRows();
    applyLiveChartData(state.liveChart, rows);
    applyLiveChartData(state.largeLiveChart, rows);
  }

  function applyLiveChartData(chart, rows) {
    if (!chart) return;
    chart.data.labels = rows.map((sample) => `${(sample.elapsedMs / 1000).toFixed(0)}s`);
    chart.data.datasets[0].data = rows.map((sample) => sample.raw);
    chart.data.datasets[1].data = rows.map((sample) => sample.average);
    chart.update("none");
  }

  function updateComparisonChart() {
    if (!state.comparisonChart) return;
    const measured = trialsWithData();
    state.comparisonChart.data.labels = measured.map((trial) => `${trial.name} (${trial.condition})`);
    state.comparisonChart.data.datasets[0].data = measured.map((trial) => summarizeTrial(trial).avgAverage);
    state.comparisonChart.update("none");
  }

  function summarizeTrial(trial) {
    const samples = trial.samples || [];
    if (!samples.length) {
      return {
        samples: 0,
        durationMs: 0,
        avgRaw: 0,
        avgAverage: 0,
        minAverage: 0,
        maxAverage: 0,
      };
    }
    return {
      samples: samples.length,
      durationMs: samples[samples.length - 1].elapsedMs,
      avgRaw: average(samples.map((sample) => sample.raw)),
      avgAverage: average(samples.map((sample) => sample.average)),
      minAverage: Math.min(...samples.map((sample) => sample.average)),
      maxAverage: Math.max(...samples.map((sample) => sample.average)),
    };
  }

  async function importCsvFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = parseImportedCsv(text, file.name);
      appendImportedTrials(result);
      updateDiagnostics("CSV-bestand ingeladen.", [
        `${result.recordCount} meetpunten verdeeld over ${result.groups.length} meetreeks(en).`,
        "Controleer de kalibratie voor je conclusies schrijft.",
      ]);
    } catch (error) {
      updateDiagnostics("CSV-bestand niet ingeladen.", [
        error.message || String(error),
        "Gebruik een CSV-bestand met tijd_ms,raw of het Smart Plants-sjabloon.",
      ]);
    } finally {
      event.target.value = "";
    }
  }

  function parseImportedCsv(text, fileName) {
    const rows = parseCsvRows(text)
      .map((cells, index) => ({ cells, index }))
      .filter((row) => row.cells.some((cell) => String(cell).trim()))
      .filter((row) => !String(row.cells[0] || "").trim().startsWith("#"));

    if (!rows.length) {
      throw new Error("Het bestand bevat geen meetrijen.");
    }

    const records = looksLikeImportHeader(rows[0].cells)
      ? parseHeaderImportRows(rows, fileName)
      : parseNumericImportRows(rows, fileName);

    if (!records.length) {
      throw new Error("Het bestand bevat geen bruikbare meetpunten.");
    }

    return {
      groups: groupImportedRecords(records, fileName),
      recordCount: records.length,
    };
  }

  function parseHeaderImportRows(rows, fileName) {
    const headers = rows[0].cells.map(normalizeHeader);
    const dataRows = rows.slice(1);
    if (!dataRows.length) {
      throw new Error("Het bestand heeft kolommen, maar geen meetrijen.");
    }

    const rawIndex = findHeaderIndex(headers, ["raw", "ruw", "sensorwaarde", "sensorwaarde_raw"]);
    if (rawIndex < 0) {
      throw new Error("Kolom raw ontbreekt.");
    }

    const trialIndex = findHeaderIndex(headers, ["trial", "meetreeks", "meting", "naam", "name"]);
    const conditionIndex = findHeaderIndex(headers, ["condition", "conditie", "bodemconditie"]);
    const waterIndex = findHeaderIndex(headers, ["water_ml", "water", "waterml", "toegevoegd_water_ml"]);
    const noteIndex = findHeaderIndex(headers, ["note", "notitie", "opmerking"]);
    const timeIndex = findHeaderIndex(headers, ["tijd_ms", "device_ms", "time_ms", "timestamp_ms", "tijdms"]);
    const elapsedSecondsIndex = findHeaderIndex(headers, ["tijd_s", "time_s", "elapsed_s", "t_s"]);
    const averageIndex = findHeaderIndex(headers, ["average", "avg", "gem", "gemiddelde", "gem_waarde"]);

    return dataRows.map((row, index) => {
      const rowNumber = row.index + 1;
      const raw = parseImportNumber(cellAt(row.cells, rawIndex));
      if (!Number.isFinite(raw)) {
        throw new Error(`Rij ${rowNumber}: raw ontbreekt of is geen getal.`);
      }

      let deviceMs = index * 1000;
      if (timeIndex >= 0) {
        deviceMs = parseImportNumber(cellAt(row.cells, timeIndex));
      } else if (elapsedSecondsIndex >= 0) {
        deviceMs = parseImportNumber(cellAt(row.cells, elapsedSecondsIndex)) * 1000;
      }
      if (!Number.isFinite(deviceMs)) {
        throw new Error(`Rij ${rowNumber}: tijd_ms is geen getal.`);
      }

      let waterMl = parseImportNumber(cellAt(row.cells, waterIndex));
      if (waterIndex < 0 || cellAt(row.cells, waterIndex) === "") waterMl = 0;
      if (!Number.isFinite(waterMl)) {
        throw new Error(`Rij ${rowNumber}: water_ml is geen getal.`);
      }

      let averageValue = raw;
      if (averageIndex >= 0 && cellAt(row.cells, averageIndex) !== "") {
        averageValue = parseImportNumber(cellAt(row.cells, averageIndex));
      }
      if (!Number.isFinite(averageValue)) {
        throw new Error(`Rij ${rowNumber}: average is geen getal.`);
      }

      const baseName = importBaseName(fileName);
      const condition = cellAt(row.cells, conditionIndex) || "Uit CSV";
      return {
        trialName: cellAt(row.cells, trialIndex) || `CSV ${baseName}`,
        condition,
        waterMl,
        note: cellAt(row.cells, noteIndex),
        deviceMs: Math.max(0, deviceMs),
        raw: clamp(raw, ADC_MIN, ADC_MAX),
        average: clamp(averageValue, ADC_MIN, ADC_MAX),
      };
    });
  }

  function parseNumericImportRows(rows, fileName) {
    const baseName = importBaseName(fileName);
    return rows.map((row) => {
      const values = row.cells.map(parseImportNumber);
      const rowNumber = row.index + 1;
      if (![2, 4].includes(values.length) || values.some((value) => !Number.isFinite(value))) {
        throw new Error(`Rij ${rowNumber}: verwacht 2 of 4 numerieke velden.`);
      }
      return {
        trialName: `CSV ${baseName}`,
        condition: "Uit CSV",
        waterMl: 0,
        note: "",
        deviceMs: Math.max(0, values[0]),
        raw: clamp(values[1], ADC_MIN, ADC_MAX),
        average: values.length === 4 ? clamp(values[2], ADC_MIN, ADC_MAX) : clamp(values[1], ADC_MIN, ADC_MAX),
      };
    });
  }

  function appendImportedTrials(result) {
    if (state.isMeasuring) stopMeasurement();
    if (hasOnlyDefaultEmptyTrial()) {
      state.trials = [];
      state.activeTrial = null;
    }

    const startedAt = Date.now();
    const startIndex = state.trials.length + 1;
    const importedTrials = result.groups.map((group, offset) => buildImportedTrial(group, startIndex + offset, startedAt + offset));
    state.trials.push(...importedTrials);
    state.activeTrial = importedTrials[importedTrials.length - 1];
    applyTrialToForm(state.activeTrial);

    const importedSamples = importedTrials.flatMap((trial) => trial.samples);
    const latestSample = importedSamples[importedSamples.length - 1];
    state.latestReading = latestSample ? { ...latestSample, rawLine: "CSV-bestand" } : state.latestReading;
    state.recentReadings = importedSamples.slice(-20).map((sample) => ({ ...sample, rawLine: "CSV-bestand" }));
    if (!state.source) els.connectionStatus.textContent = "CSV ingeladen";

    updateLiveDisplay(state.latestReading);
    renderSampleTable();
    renderTrialSummaries();
    updateCharts();
    updateControls();
    updateWorkflowState();
  }

  function buildImportedTrial(group, index, seed) {
    const firstDeviceMs = group.records[0].deviceMs;
    const samples = group.records.map((record, sampleIndex) => {
      let elapsedMs = record.deviceMs - firstDeviceMs;
      if (!Number.isFinite(elapsedMs) || elapsedMs < 0) elapsedMs = sampleIndex * 1000;
      return {
        deviceMs: record.deviceMs,
        elapsedMs,
        raw: record.raw,
        average: record.average,
        category: categorizeReading(record.average),
        source: "import",
      };
    });

    const trial = {
      id: `trial-import-${seed}`,
      index,
      name: group.name,
      condition: group.condition,
      waterMl: group.waterMl,
      note: group.note,
      samples,
      startDeviceMs: firstDeviceMs,
      lastDeviceMs: samples.length ? samples[samples.length - 1].deviceMs : firstDeviceMs,
      startedAt: new Date(),
      endedAt: new Date(),
      summary: null,
    };
    trial.summary = summarizeTrial(trial);
    return trial;
  }

  function groupImportedRecords(records, fileName) {
    const groups = new Map();
    records.forEach((record) => {
      const name = record.trialName || `CSV ${importBaseName(fileName)}`;
      const condition = record.condition || "Uit CSV";
      const waterMl = Number.isFinite(record.waterMl) ? record.waterMl : 0;
      const note = record.note || "";
      const key = [name, condition, waterMl, note].join("\u001f");
      if (!groups.has(key)) {
        groups.set(key, { name, condition, waterMl, note, records: [] });
      }
      groups.get(key).records.push(record);
    });
    return [...groups.values()];
  }

  function hasOnlyDefaultEmptyTrial() {
    if (state.trials.length !== 1) return false;
    const trial = state.trials[0];
    return trial
      && trial.samples.length === 0
      && trial.name === "Meting 1"
      && trial.condition === "Droog"
      && Number(trial.waterMl) === 0
      && !trial.note;
  }

  function parseCsvRows(text) {
    const delimiter = detectCsvDelimiter(text);
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;
    const input = String(text || "").replace(/^\uFEFF/, "");

    for (let index = 0; index < input.length; index += 1) {
      const char = input[index];
      const next = input[index + 1];
      if (inQuotes) {
        if (char === '"' && next === '"') {
          cell += '"';
          index += 1;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          cell += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        row.push(cell.trim());
        cell = "";
      } else if (char === "\n") {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = "";
      } else if (char === "\r") {
        if (next !== "\n") {
          row.push(cell.trim());
          rows.push(row);
          row = [];
          cell = "";
        }
      } else {
        cell += char;
      }
    }

    if (cell || row.length) {
      row.push(cell.trim());
      rows.push(row);
    }
    return rows;
  }

  function detectCsvDelimiter(text) {
    const firstLine = String(text || "")
      .split(/\r?\n/)
      .find((line) => line.trim() && !line.trim().startsWith("#")) || "";
    const semicolons = (firstLine.match(/;/g) || []).length;
    const commas = (firstLine.match(/,/g) || []).length;
    return semicolons > commas ? ";" : ",";
  }

  function looksLikeImportHeader(cells) {
    const headers = cells.map(normalizeHeader);
    return findHeaderIndex(headers, ["raw", "ruw", "sensorwaarde", "sensorwaarde_raw"]) >= 0
      || findHeaderIndex(headers, ["tijd_ms", "device_ms", "time_ms", "timestamp_ms", "tijd_s"]) >= 0
      || findHeaderIndex(headers, ["trial", "meetreeks", "meting"]) >= 0;
  }

  function normalizeHeader(value) {
    return String(value || "")
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[().-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function findHeaderIndex(headers, aliases) {
    return headers.findIndex((header) => aliases.includes(header));
  }

  function cellAt(cells, index) {
    if (index < 0) return "";
    return String(cells[index] == null ? "" : cells[index]).trim();
  }

  function parseImportNumber(value) {
    const normalized = String(value == null ? "" : value).trim().replace(/\s/g, "").replace(",", ".");
    return normalized === "" ? NaN : Number(normalized);
  }

  function importBaseName(fileName) {
    return String(fileName || "CSV")
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .trim() || "CSV";
  }

  function exportCsv() {
    const measured = trialsWithData();
    if (!measured.length) {
      alert("Er zijn nog geen meetgegevens om te exporteren.");
      return;
    }
    const lines = calibrationCsvCommentLines();
    lines.push("meetreeks,conditie,water_ml,notitie,tijd_s,device_ms,raw,average,categorie,bron");
    measured.forEach((trial) => {
      trial.samples.forEach((sample) => {
        lines.push([
          csvCell(trial.name),
          csvCell(trial.condition),
          Number.isFinite(trial.waterMl) ? trial.waterMl : "",
          csvCell(trial.note),
          (sample.elapsedMs / 1000).toFixed(0),
          sample.deviceMs.toFixed(0),
          sample.raw.toFixed(0),
          sample.average.toFixed(0),
          csvCell(sample.category),
          csvCell(sourceLabel(sample.source)),
        ].join(","));
      });
    });
    downloadFile(`smart_plants_${dateStamp()}.csv`, lines.join("\n"), "text/csv;charset=utf-8");
  }

  function calibrationCsvCommentLines() {
    const quality = state.calibration.quality || evaluateCalibrationQuality();
    return [
      ["# export", "Project Smart Plants", new Date().toISOString()].map(csvCell).join(","),
      [
        "# kalibratie",
        "droog",
        formatOptional(state.calibration.dry, 0),
        "licht_vochtig",
        formatOptional(state.calibration.moist, 0),
        "nat",
        formatOptional(state.calibration.wet, 0),
      ].map(csvCell).join(","),
      [
        "# drempels",
        "richting",
        directionLabel(),
        "droog_vochtig",
        formatOptional(state.calibration.dryThreshold, 0),
        "vochtig_nat",
        formatOptional(state.calibration.wetThreshold, 0),
      ].map(csvCell).join(","),
      [
        "# kalibratiecheck",
        "status",
        quality.status,
        "verschil",
        Number.isFinite(quality.smallestGap) ? quality.smallestGap.toFixed(0) : "--",
        "uitleg",
        quality.detail,
      ].map(csvCell).join(","),
    ];
  }

  function generatePdfReport() {
    if (!(window.jspdf && window.jspdf.jsPDF)) {
      alert("jsPDF kon niet geladen worden. Controleer vendor/jspdf.umd.min.js.");
      return;
    }
    const measured = trialsWithData();
    if (!measured.length) {
      alert("Er zijn nog geen meetgegevens om te rapporteren.");
      return;
    }
    if (state.isMeasuring) stopMeasurement();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 14;
    let y = 18;

    doc.setFontSize(18);
    doc.text("Rapport Project Smart Plants", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Datum: ${new Date().toLocaleDateString("nl-BE")}`, margin, y);
    y += 5;
    doc.text(`Namen: ${els.inputNames.value.trim() || "-"}`, margin, y);
    y += 5;
    doc.text(`Klas: ${els.inputClass.value.trim() || "-"}`, margin, y);
    y += 8;

    y = addTextBlock(doc, y, "Onderzoeksvraag", els.inputQuestion.value);
    y = addTextBlock(doc, y, "Hypothese", els.inputHypothesis.value);
    y = addTextBlock(doc, y, "Variabelen", [
      `Onafhankelijke variabele: ${els.inputIndependent.value || "-"}`,
      `Afhankelijke variabele: ${els.inputDependent.value || "-"}`,
      `Gecontroleerde variabelen: ${els.inputControlled.value || "-"}`,
    ].join("\n"));

    if (doc.autoTable) {
      const quality = state.calibration.quality || evaluateCalibrationQuality();
      doc.autoTable({
        startY: y,
        head: [["Kalibratie", "Waarde"]],
        body: [
          ["Droog", formatOptional(state.calibration.dry, 0)],
          ["Licht vochtig", formatOptional(state.calibration.moist, 0)],
          ["Nat", formatOptional(state.calibration.wet, 0)],
          ["Richting", directionLabel()],
          ["Drempel droog/vochtig", formatOptional(state.calibration.dryThreshold, 0)],
          ["Drempel vochtig/nat", formatOptional(state.calibration.wetThreshold, 0)],
          ["Kwaliteit van de kalibratie", quality.status],
          ["Uitleg", quality.detail],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [82, 0, 255] },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    const summaryRows = measured.map((trial) => {
      const summary = summarizeTrial(trial);
      return [
        trial.name,
        trial.condition,
        Number.isFinite(trial.waterMl) ? `${trial.waterMl} ml` : "-",
        formatDuration(summary.durationMs),
        formatNumber(summary.avgAverage, 0),
        formatNumber(summary.minAverage, 0),
        formatNumber(summary.maxAverage, 0),
      ];
    });

    if (doc.autoTable) {
      doc.autoTable({
        startY: y,
        head: [["Meetreeks", "Bodem", "Water", "Duur", "Gem.", "Min", "Max"]],
        body: summaryRows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [82, 0, 255] },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (state.comparisonChart) {
      y = ensurePdfSpace(doc, y, 90);
      doc.setFontSize(12);
      doc.text("Vergelijkende grafiek", margin, y);
      y += 4;
      try {
        state.comparisonChart.resize(900, 390);
        state.comparisonChart.update("none");
        doc.addImage(state.comparisonChart.toBase64Image("image/png", 1), "PNG", margin, y, 180, 78);
        y += 86;
      } catch (error) {
        console.warn("Kon grafiek niet aan PDF toevoegen:", error);
      }
    }

    y = addTextBlock(doc, y, "Besluit", els.inputConclusion.value);
    y = addTextBlock(doc, y, "Betrouwbaarheid", els.inputReliability.value);
    y = addTextBlock(doc, y, "Verbetering", els.inputImprovement.value);

    doc.addPage();
    doc.setFontSize(12);
    doc.text("Meetdata", margin, 18);
    if (doc.autoTable) {
      const rawRows = measured.flatMap((trial) => trial.samples.map((sample) => [
        trial.name,
        (sample.elapsedMs / 1000).toFixed(0),
        sample.raw.toFixed(0),
        sample.average.toFixed(0),
        sample.category,
      ]));
      doc.autoTable({
        startY: 24,
        head: [["Meetreeks", "t (s)", "Ruw", "Gem.", "Categorie"]],
        body: rawRows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [82, 0, 255] },
      });
    }

    doc.save(`Rapport_Project_Smart_Plants_${dateStamp()}.pdf`);
    closeOverlay(els.reportModal);
  }

  function updateControls() {
    const hasSource = Boolean(state.source);
    const hasLatest = Boolean(state.latestReading);
    els.btnStart.disabled = !hasSource || state.isMeasuring;
    els.btnStop.disabled = !state.isMeasuring;
    [els.btnCaptureDry, els.btnCaptureMoist, els.btnCaptureWet].forEach((button) => {
      if (button) button.disabled = !hasLatest;
    });
    els.btnReport.disabled = !trialsWithData().length;
  }

  function updateWorkflowState() {
    const setupInputs = els.setupChecklist ? [...els.setupChecklist.querySelectorAll("input[type='checkbox']")] : [];
    const complete = {
      prediction: Boolean(els.inputQuestion.value.trim() && els.inputHypothesis.value.trim()),
      setup: setupInputs.length > 0 && setupInputs.every((input) => input.checked),
      calibration: thresholdsReady(),
      measurement: trialsWithData().length > 0,
      comparison: trialsWithData().length > 0,
      conclusion: Boolean(els.inputConclusion.value.trim()),
    };
    els.workflowLinks.forEach((link) => {
      link.classList.toggle("is-complete", Boolean(complete[link.dataset.stepLink]));
    });
  }

  function showWorkflowStep(index, options = {}) {
    if (!els.workflowSections.length) return;
    const nextIndex = Math.min(Math.max(index, 0), els.workflowSections.length - 1);
    state.currentStepIndex = nextIndex;

    els.workflowSections.forEach((section, sectionIndex) => {
      const isActive = sectionIndex === nextIndex;
      section.classList.toggle("is-active-step", isActive);
      section.hidden = !isActive;
    });

    const activeSection = els.workflowSections[nextIndex];
    markActiveStep(activeSection.id);
    updateStepNavigation();

    window.setTimeout(() => {
      if (state.liveChart) state.liveChart.resize();
      if (state.largeLiveChart) state.largeLiveChart.resize();
      if (state.comparisonChart) state.comparisonChart.resize();
      updateCharts();
    }, 0);

    if (options.scroll !== false) {
      document.querySelector(".app-shell").scrollIntoView({ behavior: "smooth", block: "start" });
      activeSection.focus({ preventScroll: true });
    }
  }

  function updateStepNavigation() {
    const total = els.workflowSections.length;
    const current = state.currentStepIndex + 1;
    const activeLabel = els.workflowSections[state.currentStepIndex]
      ? els.workflowSections[state.currentStepIndex].querySelector("h2").textContent
      : "";
    els.stepCounters.forEach((counter) => {
      counter.textContent = `Stap ${current} van ${total}${activeLabel ? `: ${activeLabel}` : ""}`;
    });
    els.stepPrevButtons.forEach((button) => {
      button.disabled = state.currentStepIndex === 0;
    });
    els.stepNextButtons.forEach((button) => {
      const isLast = state.currentStepIndex === total - 1;
      button.disabled = isLast;
      button.textContent = isLast ? "Laatste stap" : "Volgende";
    });
  }

  function markActiveStep(id) {
    els.workflowLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.stepLink === id);
    });
  }

  function openOverlay(overlay) {
    if (overlay) overlay.classList.remove("hidden");
  }

  function closeOverlay(overlay) {
    if (overlay) overlay.classList.add("hidden");
  }

  function openLiveChartModal() {
    openOverlay(els.liveChartModal);
    if (!state.largeLiveChart && els.liveChartLargeCanvas) {
      state.largeLiveChart = createLiveChart(els.liveChartLargeCanvas, "large");
    }
    updateLiveChart();
    window.requestAnimationFrame(() => {
      if (state.largeLiveChart) {
        state.largeLiveChart.resize();
        state.largeLiveChart.update("none");
      }
    });
  }

  function openSchemaImageViewer(button) {
    const figure = button.closest(".schematic-frame");
    const image = figure?.querySelector("img");
    const caption = figure?.querySelector("figcaption");
    if (!image || !els.schemaViewerImage) return;

    els.schemaViewerImage.src = image.currentSrc || image.src;
    els.schemaViewerImage.alt = image.alt || "Vergroot schema";
    if (els.schemaViewerCaption) {
      els.schemaViewerCaption.textContent = caption?.textContent?.trim() || image.alt || "";
    }
    openOverlay(els.schemaImageViewer);
  }

  function addTextBlock(doc, y, title, text) {
    y = ensurePdfSpace(doc, y, 22);
    doc.setFontSize(12);
    doc.text(title, 14, y);
    y += 5;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize((text || "-").trim() || "-", 180);
    lines.forEach((line) => {
      y = ensurePdfSpace(doc, y, 6);
      doc.text(line, 14, y);
      y += 5;
    });
    return y + 4;
  }

  function ensurePdfSpace(doc, y, needed) {
    if (y + needed <= 285) return y;
    doc.addPage();
    return 18;
  }

  function trialsWithData() {
    return state.trials.filter((trial) => trial.samples.length);
  }

  function thresholdsReady() {
    return Number.isFinite(state.calibration.dryThreshold)
      && Number.isFinite(state.calibration.wetThreshold)
      && state.calibration.direction !== "unknown";
  }

  function directionLabel() {
    if (state.calibration.direction === "lower_is_wetter") return "Lagere waarde = natter";
    if (state.calibration.direction === "higher_is_wetter") return "Hogere waarde = natter";
    return "Onbekend";
  }

  function labelForCalibration(kind) {
    return { dry: "Droog", moist: "Licht vochtig", wet: "Nat" }[kind] || kind;
  }

  function defaultConditionForIndex(index) {
    return ["Droog", "Licht vochtig", "Nat"][Math.min(index - 1, 2)] || "Andere conditie";
  }

  function defaultWaterForIndex(index) {
    return [0, 20, 40][Math.min(index - 1, 2)] || 0;
  }

  function updateDiagnostics(summary, items = []) {
    els.diagnosticSummary.textContent = summary;
    els.diagnosticList.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function average(values) {
    const valid = values.filter(Number.isFinite);
    return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatNumber(value, digits = 1) {
    return Number.isFinite(value) ? Number(value).toFixed(digits) : "--";
  }

  function formatOptional(value, digits = 0) {
    return Number.isFinite(value) ? Number(value).toFixed(digits) : "--";
  }

  function formatDuration(ms) {
    return `${Math.max(0, ms / 1000).toFixed(0)} s`;
  }

  function csvCell(value) {
    const text = String(value == null ? "" : value);
    if (/[",\n;]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }

  function dateStamp() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }
});
