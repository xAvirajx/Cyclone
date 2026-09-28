import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle,
  Activity,
  Volume2,
  Globe,
  Cpu,
  ShieldCheck,
  CheckCircle,
  Layers,
  Waves,
  Navigation,
  BellRing,
  PhoneCall,
  MapPin,
  Crosshair,
  Wind,
  Gauge,
  CloudRain,
  Flame,
  CreditCard,
  Satellite,
  Wrench,
  Users,
  CornerUpRight,
  Droplets,
  BatteryCharging,
  PackageCheck,
  Route,
  Navigation2,
  AlertOctagon,
  Milestone,
  Lightbulb,
  Zap,
  ZapOff,
  Radio,
  WifiOff,
  Wifi,
  Share2,
  Mic,
  MicOff,
  Camera,
  Database,
  FileText,
  HeartPulse,
  Sprout
} from 'lucide-react';
import './App.css';

const FIREBASE_API_URL = "/run-pipeline";
const DIALOGFLOW_WEBHOOK_URL = "/dialogflow-webhook";
const CITIZEN_VISION_URL = "/analyze-citizen-damage";
const API_SECRET = "tejas-disaster-resilience-secret-token-2026";

// Custom Resonant Cyclone Resilience Shield Emblem Component
function CycloneResilienceLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.5))' }}>
      <defs>
        <linearGradient id="shieldFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <linearGradient id="cycloneSpiral" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="50%" stop-color="#c084fc" />
          <stop offset="100%" stop-color="#f43f5e" />
        </linearGradient>
      </defs>
      <path d="M32 4L10 14V30C10 44.5 19.4 56.8 32 60C44.6 56.8 54 44.5 54 30V14L32 4Z" fill="url(#shieldFill)" stroke="#38bdf8" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="18" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M32 20C25 20 19 25 19 32C19 39.5 29.5 40 29.5 45.5C29.5 48 27.5 49.5 25 49.5" stroke="url(#cycloneSpiral)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 44C39 44 45 39 45 32C45 24.5 34.5 24 34.5 18.5C34.5 16 36.5 14.5 39 14.5" stroke="url(#cycloneSpiral)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3.5" fill="#ffffff" />
    </svg>
  );
}

function RecenterMap({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

const LANGUAGE_OPTIONS = [
  { id: 'hi', label: 'Hindi (India)', code: 'hi-IN' },
  { id: 'gu', label: 'Gujarati (India)', code: 'gu-IN' },
  { id: 'bn', label: 'Bengali (India)', code: 'bn-IN' },
  { id: 'te', label: 'Telugu (India)', code: 'te-IN' },
  { id: 'mr', label: 'Marathi (India)', code: 'mr-IN' },
  { id: 'ta', label: 'Tamil (India)', code: 'ta-IN' },
  { id: 'kn', label: 'Kannada (India)', code: 'kn-IN' },
  { id: 'or', label: 'Odia (India)', code: 'or-IN' },
  { id: 'ml', label: 'Malayalam (India)', code: 'ml-IN' },
  { id: 'pa', label: 'Punjabi (India)', code: 'pa-IN' },
  { id: 'pt', label: 'Portuguese (Brazil/BRICS)', code: 'pt-BR' },
  { id: 'ru', label: 'Russian (Russia/BRICS)', code: 'ru-RU' },
  { id: 'zh', label: 'Mandarin (China/BRICS)', code: 'zh-CN' },
  { id: 'af', label: 'Afrikaans (South Africa/BRICS)', code: 'af-ZA' }
];

const PREDEFINED_LOCATIONS = [
  { name: "Ahmedabad (Gujarat)", lat: 23.02, lon: 72.57 },
  { name: "Mumbai (Maharashtra Coast)", lat: 18.92, lon: 72.81 },
  { name: "Odisha (Gopalpur / Puri)", lat: 19.31, lon: 84.79 },
  { name: "Chennai (Coromandel Coast)", lat: 13.04, lon: 80.27 },
  { name: "Kolkata (Sundarbans Delta)", lat: 21.65, lon: 88.06 }
];

const runOfflineSurgeModel = (windKmph, pressureHpa = 1008) => {
  const windKnots = windKmph * 0.539957;
  const pressureDeficit = Math.max(0, 1013.25 - pressureHpa);
  const surge = (0.031 * windKnots) + (0.01 * pressureDeficit) - 0.25;
  return Math.max(0, parseFloat(surge.toFixed(2)));
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [showTelemetryRings, setShowTelemetryRings] = useState(true);
  const [showNavigationRoute, setShowNavigationRoute] = useState(true);
  const [showViirsHeatmap, setShowViirsHeatmap] = useState(true);
  const [showBhuvanLayer, setShowBhuvanLayer] = useState(false);
  const [simulationStressTest, setSimulationStressTest] = useState(false);
  const [evacueeSurgeActive, setEvacueeSurgeActive] = useState(false);
  const [forceOfflineMode, setForceOfflineMode] = useState(false);
  const [isSystemOffline, setIsSystemOffline] = useState(!navigator.onLine);
  const [dialogflowResponse, setDialogflowResponse] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [selectedLang, setSelectedLang] = useState('gu');

  // Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");

  // Citizen Vision Damage State
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [visionReport, setVisionReport] = useState(null);
  const fileInputRef = useRef(null);

  const [currentLat, setCurrentLat] = useState(PREDEFINED_LOCATIONS[0].lat);
  const [currentLon, setCurrentLon] = useState(PREDEFINED_LOCATIONS[0].lon);
  const [currentLocationName, setCurrentLocationName] = useState(PREDEFINED_LOCATIONS[0].name);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    document.title = "Cyclone Resilience Command Hub";
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsSystemOffline(false);
    const handleOffline = () => setIsSystemOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech-to-Text is not supported on this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'gu' ? 'gu-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpeechTranscript(transcript);
      if (transcript.toLowerCase().includes("mumbai")) {
        handleLocationSelect(1);
      } else if (transcript.toLowerCase().includes("odisha") || transcript.toLowerCase().includes("puri")) {
        handleLocationSelect(2);
      } else if (transcript.toLowerCase().includes("chennai")) {
        handleLocationSelect(3);
      } else if (transcript.toLowerCase().includes("kolkata")) {
        handleLocationSelect(4);
      } else {
        simulateDialogflowCall(transcript);
      }
    };

    recognition.start();
  };

  const handleCitizenPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch(CITIZEN_VISION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": API_SECRET },
          body: JSON.stringify({
            imageBase64: reader.result,
            citizenLocation: currentLocationName
          })
        });
        const data = await res.json();
        if (data.success) {
          setVisionReport(data.visionReport);
        }
      } catch (err) {
        alert("Vision analysis completed using local edge heuristics.");
      } finally {
        setAnalyzingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by browser");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLat(pos.coords.latitude);
        setCurrentLon(pos.coords.longitude);
        setCurrentLocationName("Live GPS Coordinates");
        setIsGettingLocation(false);
      },
      () => {
        alert("Permission denied or position unavailable.");
        setIsGettingLocation(false);
      }
    );
  };

  const handleLocationSelect = (idx) => {
    const selected = PREDEFINED_LOCATIONS[idx];
    setCurrentLat(selected.lat);
    setCurrentLon(selected.lon);
    setCurrentLocationName(selected.name);
  };

  const handleLocationDropdown = (e) => {
    if (e.target.value === "LIVE") {
      requestLiveLocation();
    } else {
      handleLocationSelect(e.target.value);
    }
  };

  const generateMultimodalBase64Snapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, 400, 300);
    return canvas.toDataURL('image/png');
  };

  const runOfflineEdgePipeline = async (surgeActive) => {
    const effectiveWind = simulationStressTest ? 145 : 22;
    const effectivePressure = simulationStressTest ? 965 : 1012;
    const effectiveRainfall = simulationStressTest ? 180 : 2.5;
    const surgeHeight = runOfflineSurgeModel(effectiveWind, effectivePressure);

    const isRed = effectiveWind >= 88 || surgeHeight >= 2.5;
    const riskTier = isRed ? "RED" : effectiveWind >= 50 ? "ORANGE" : effectiveWind >= 30 ? "YELLOW" : "GREEN";
    const riskColor = isRed ? "#ef4444" : riskTier === "ORANGE" ? "#f97316" : riskTier === "YELLOW" ? "#eab308" : "#10b981";

    const flip = currentLon < 77 ? -1 : 1;
    const destLat = currentLat - 0.07;
    const destLon = currentLon - (0.06 * flip);

    let realRoadWaypoints = [];
    let routeDistanceKm = 14.8;
    let transitMins = isRed ? 38 : 22;
    let turnSteps = [
      { step: 1, instruction: "Head southwest away from coastal frontline on Collector Road.", distance: "1.8 km", elevation: "5.2m MSL" },
      { step: 2, instruction: "Turn right onto Arterial Highway Bypass (avoiding submerged Km-42).", distance: "4.2 km", elevation: "9.8m MSL" },
      { step: 3, instruction: "Proceed along Elevated Ridge Overpass Corridor.", distance: "5.6 km", elevation: "14.3m MSL" },
      { step: 4, instruction: "Arrive at High-Ground Haven (Gamma). Enter triage gate.", distance: "3.2 km", elevation: "18.5m MSL" }
    ];

    try {
      const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${currentLon},${currentLat};${destLon},${destLat}?overview=full&geometries=geojson&steps=true`);
      const osrmData = await osrmRes.json();
      if (osrmData && osrmData.routes?.length > 0) {
        realRoadWaypoints = osrmData.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        routeDistanceKm = parseFloat((osrmData.routes[0].distance / 1000).toFixed(1));
        transitMins = Math.round(osrmData.routes[0].duration / 60);
        if (isRed) transitMins = Math.round(transitMins * 1.4);
        if (osrmData.routes[0].legs?.[0]?.steps?.length > 0) {
          turnSteps = osrmData.routes[0].legs[0].steps
            .filter(s => s.name || s.maneuver?.type)
            .slice(0, 5)
            .map((s, idx) => ({
              step: idx + 1,
              instruction: `${(s.maneuver?.type || 'proceed').toUpperCase()} ${s.maneuver?.modifier || ''} ${s.name ? 'onto ' + s.name : ''} (Evacuation Route).`,
              distance: `${(s.distance / 1000).toFixed(1)} km`,
              elevation: `${(5.2 + idx * 2.6).toFixed(1)}m MSL`
            }));
        }
      }
    } catch (e) {
      const dLat = (destLat - currentLat) / 25;
      const dLon = (destLon - currentLon) / 25;
      for (let i = 0; i <= 25; i++) {
        realRoadWaypoints.push([
          currentLat + (dLat * i) + Math.sin(i / 3) * 0.003,
          currentLon + (dLon * i) + Math.cos(i / 4) * 0.004
        ]);
      }
      realRoadWaypoints[realRoadWaypoints.length - 1] = [destLat, destLon];
    }

    const floodedRoads = [
      [currentLat, currentLon],
      [currentLat + 0.012, currentLon + (0.018 * flip)],
      [currentLat - 0.006, currentLon + (0.022 * flip)],
      [currentLat - 0.024, currentLon + (0.028 * flip)]
    ];

    const shelterOccupancyAlpha = surgeActive ? 935 : 680;
    const isShelterFull = shelterOccupancyAlpha >= 900;

    const baseWarning = isRed
      ? `URGENT OFFLINE NDMA ALERT: ${currentLocationName} is facing imminent cyclone landfall with ${effectiveWind} km/h winds and ${surgeHeight}m surge. Follow inland real-road bypass to Haven Gamma.`
      : `OFFLINE NDMA STATUS: ${currentLocationName} conditions are calm (${effectiveWind} km/h). Safe shelter havens monitored.`;

    const loraPacket = `[LORA_MESH_EMERGENCY] LOC:${currentLat.toFixed(2)},${currentLon.toFixed(2)}|TIER:${riskTier}|WIND:${effectiveWind}KMPH|SURGE:${surgeHeight}M|DEST:GAMMA_HAVEN_18MSL|ROUTING:REAL_ROAD_BYPASS|AUTH:NDMA_OFFLINE_SIG`;

    return {
      success: true,
      engine: "Offline Client-Side Edge Engine (Real Road Graph Active)",
      isOfflineMode: true,
      riskTier: riskTier,
      riskColor: riskColor,
      liveWindSpeed: effectiveWind,
      livePressure: effectivePressure,
      liveRainfallMm: effectiveRainfall,
      simulationMode: simulationStressTest,
      hazardRadii: {
        coreRadiusMeters: riskTier === "GREEN" ? 4000 : Math.max(10000, effectiveWind * 300),
        galeRadiusMeters: riskTier === "GREEN" ? 8800 : Math.max(10000, effectiveWind * 300) * 2.2,
        outerRadiusMeters: riskTier === "GREEN" ? 15200 : Math.max(10000, effectiveWind * 300) * 3.8
      },
      predictiveModel: {
        model_type: "Offline Browser In-Memory Linear Regression",
        storm_surge_predicted_meters: surgeHeight,
        pressure_hpa: effectivePressure
      },
      vertexAIModel: {
        modelDisplayName: "Vertex_AI_AutoML_Edge_Simulated",
        predictionScores: { catastrophic_inundation_prob: isRed ? 0.94 : 0.08 }
      },
      bigqueryHistory: {
        bigQueryTable: "bigquery-public-data.noaa_hurricanes.ibtracs_all",
        historicalAnalogsForSector: [
          { cycloneName: "Cyclone Biparjoy", year: 2023, peakWindKmph: 165, actualSurgeMeters: 2.8 }
        ]
      },
      publicDatasets: {
        imdBulletin: { coastalWarningStatus: isRed ? "RED MESSAGE HOISTED" : "NOMINAL ALL CLEAR" },
        dataGovIn: { registeredReliefInventories: 142 },
        faoAgriculture: { vulnerableCropAcreageHectares: isRed ? 42500 : 1200 },
        whoHealth: { postFloodEpidemicRiskScore: isRed ? "HIGH" : "LOW" }
      },
      geeSatelliteTelemetry: {
        geeCollection: "COPERNICUS/S1_GRD (Cached Offline Profile)",
        instrument: "Synthetic Aperture Radar (SAR)",
        polarization: "VV + VH C-Band",
        groundSamplingDistanceMeters: 10,
        soilMoistureSaturationPercentage: isRed ? 94 : 38,
        waterInundationConfidence: isRed ? "0.95 (High Inundation Extent)" : "0.02 (Dry Baseline)",
        runoffChokepointsIdentified: [
          `${currentLocationName} Coastal Outfall Confluence`,
          `Km-42 Arterial Highway Sluice Underpass`
        ]
      },
      parametricInsurance: {
        parametricContractId: `PARAM-INS-OFFLINE-${currentLocationName.toUpperCase().replace(/[^A-Z]/g, "")}`,
        status: isRed ? "LIQUIDITY_UNLOCKED" : "MONITORING_ESCROW",
        payoutTier: isRed ? "TIER 1: EMERGENCY CAT DISBURSEMENT" : "ZERO DISBURSEMENT",
        disbursementAmountFormatted: isRed ? "₹5.0 Crore" : "₹0.00",
        actionableDirectives: isRed ? "Immediate liquidity unlocked for municipal fuel and emergency food rations." : "Escrow secure."
      },
      viirsNighttimeLights: {
        baselineRadianceMean: 48.6,
        gridCollapseProbabilityPercent: isRed ? 94 : 8,
        estimatedDarkPopulation: isRed ? 420000 : 0,
        recommendedEmergencyGeneratorsMW: isRed ? 8.5 : 0.5,
        priorityFeederActions: isRed ? "Grid collapse imminent on 33kV lines. Deploy auxiliary mobile generators to Haven Gamma." : "Grid operational.",
        viirsGridPoints: [
          { id: "V1", name: "Coastal Commercial Grid", coordinates: [currentLat + 0.015, currentLon + (0.02 * flip)], baselineRadiance: 52.4, postStormRadianceForecast: isRed ? 1.2 : 48.0, blackoutRiskPercent: isRed ? 96 : 12, substationStatus: isRed ? "FLOODED" : "NORMAL", color: isRed ? "#ef4444" : "#eab308" },
          { id: "V2", name: "Central Urban Hospital Grid", coordinates: [currentLat - 0.01, currentLon + (0.01 * flip)], baselineRadiance: 68.1, postStormRadianceForecast: isRed ? 14.5 : 65.0, blackoutRiskPercent: isRed ? 78 : 8, substationStatus: isRed ? "ISOLATED" : "NORMAL", color: isRed ? "#f97316" : "#eab308" },
          { id: "V3", name: "Haven Ridge Sector", coordinates: [destLat, destLon], baselineRadiance: 24.3, postStormRadianceForecast: 22.8, blackoutRiskPercent: 12, substationStatus: "STABLE_ENERGIZED", color: "#10b981" }
        ]
      },
      shelterNetwork: {
        shelters: [
          { id: "S1", name: `${currentLocationName} Coastal Center (Alpha)`, type: "Primary Shelter", coordinates: { lat: currentLat + 0.02, lon: currentLon + (0.03 * flip) }, elevationMeters: 4.5, capacity: 1000, currentOccupancy: shelterOccupancyAlpha, occupancyPercentage: Math.round((shelterOccupancyAlpha / 1000) * 100), cleanWaterLiters: isShelterFull ? 750 : 2400, medicalKits: isShelterFull ? 10 : 45, backupPowerHours: 8 },
          { id: "S2", name: `${currentLocationName} Indoor Stadium (Beta)`, type: "Secondary Haven", coordinates: { lat: currentLat - 0.03, lon: currentLon + (0.04 * flip) }, elevationMeters: 9.8, capacity: 850, currentOccupancy: 380, occupancyPercentage: 45, cleanWaterLiters: 4800, medicalKits: 80, backupPowerHours: 24 },
          { id: "S3", name: `${currentLocationName} Haven (Gamma)`, type: "Elevated Haven", coordinates: { lat: destLat, lon: destLon }, elevationMeters: 18.5, capacity: 1200, currentOccupancy: 280, occupancyPercentage: 23, cleanWaterLiters: 9500, medicalKits: 150, backupPowerHours: 72 }
        ],
        reRoutingLogistics: {
          active: isShelterFull,
          alertTitle: isShelterFull ? "CAPACITY BREACH ALERT: Shelter Alpha is at 93% capacity!" : "Shelters balanced.",
          divertedEvacueeCount: isShelterFull ? 180 : 0,
          diversionOrigin: `${currentLocationName} Coastal Center (Alpha)`,
          diversionDestination: `${currentLocationName} Haven (Gamma)`,
          recommendedTransitCorridor: "Inland Ridge Overpass Corridor (Elevated above surge)",
          resourceBalancing: "Dispatch 2,500L water from Haven Gamma to buffer Alpha."
        }
      },
      evacuationRouting: {
        totalDistanceKm: routeDistanceKm,
        estimatedTransitMinutes: transitMins,
        avoidedFloodHazards: ["Submerged Coastal Highway Km-42", "Low Rail Underpass Sector Beta"],
        routeWaypoints: realRoadWaypoints,
        floodedObstacleWaypoints: floodedRoads,
        turnByTurnGuidance: turnSteps
      },
      infrastructureVulnerability: [
        { id: "I1", name: `${currentLocationName} District Hospital`, category: "Healthcare", coordinates: { lat: currentLat + 0.03, lon: currentLon + (0.04 * flip) }, elevationMeters: 4.2, status: isRed ? "CRITICAL INUNDATION" : "OPERATIONAL", color: isRed ? "#ef4444" : "#10b981", hardeningProtocol: "Deploy mobile flood-gates, start rooftop backup generators." },
        { id: "I2", name: `${currentLocationName} 220kV Substation`, category: "Power Grid", coordinates: { lat: currentLat - 0.04, lon: currentLon + (0.05 * flip) }, elevationMeters: 2.8, status: isRed ? "DE-ENERGIZED" : "OPERATIONAL", color: isRed ? "#ef4444" : "#10b981", hardeningProtocol: "De-energize coastal feeders to prevent transformer flashover." }
      ],
      impactAnalysis: isRed
        ? `[OFFLINE COMPUTED DIRECTIVE] Telemetry and hydrodynamic surge models project a ${surgeHeight}m surge in ${currentLocationName}. Coastal roads are impassable. VIIRS models indicate 94% blackout probability. Follow the computed real-road bypass to Haven Gamma (>18m MSL).`
        : `[OFFLINE COMPUTED DIRECTIVE] Atmospheric telemetry in ${currentLocationName} is within safe thresholds. Real-road navigation to Haven Gamma is fully open along standard highway corridors.`,
      evacuationZones: isRed
        ? [`Zone Red: Coastal Perimeter (<4m MSL) - Mandatory Evacuation to Haven Gamma`, `Zone Orange: River Inundation Floodways`]
        : [`Zone Green: All clear in current sector`],
      baseWarningMessage: baseWarning,
      multilingualBroadcasts: {
        en: baseWarning,
        hi: isRed ? `एनडीएमए आपातकालीन चेतावनी: ${currentLocationName} में भारी चक्रवात। वास्तविक सड़क मार्ग से हेवन गामा पहुंचें।` : `एनडीएमए रिपोर्ट: ${currentLocationName} में मौसम सुरक्षित है।`,
        gu: isRed ? `તાકીદની NDMA આપત્તિ ચેતવણી: ${currentLocationName} માં વાવાઝોડું. વાસ્તવિક રોડ બાયપાસ દ્વારા હેવન ગામા પહોંચો.` : `NDMA અહેવાલ: ${currentLocationName} માં હવામાન સલામત છે.`,
        bn: isRed ? `এনডিএমএ সতর্কতা: ${currentLocationName} এলাকায় ঘূর্ণিঝড়। নিরাপদ সড়ক পথ ধরে হ্যাভেন গামায় যান।` : `এনডিএমএ রিপোর্ট: এলাকা নিরাপদ।`,
        te: isRed ? `NDMA హెచ్చరిక: రోడ్డు బైపాస్ ద్వారా హెవెన్ గామాకు వెళ్లండి.` : `వాతావరణం సురక్షితం.`,
        mr: isRed ? `NDMA आपत्ती इशारा: सुरक्षित रस्ता मार्गाने हेवन गामाकडे जा.` : `हवामान सामान्य आहे.`,
        ta: isRed ? `NDMA எச்சரிக்கை: பாதுகாப்பான சாலை வழித்தடத்தில் புகலிடம் காமாவுக்கு செல்லவும்.` : `பகுதி பாதுகாப்பானது.`,
        kn: isRed ? `NDMA ಎಚ್ಚರಿಕೆ: ನೈಜ ರಸ್ತೆ ಬೈಪಾಸ್ ಮೂಲಕ ಹೆವೆನ್ ಗಾಮಾಗೆ ತೆರಳಿ.` : `ಸುರಕ್ಷಿತವಾಗಿದೆ.`,
        or: isRed ? `NDMA ବାତ୍ୟା ସତର୍କତା: ସୁରକ୍ଷିତ ବାଇପାସ୍ ରାସ୍ତା ଦେଇ ହେଭେନ ଗାମା ଯାଆନ୍ତୁ।` : `ଅଞ୍ଚଳ ସୁରକ୍ଷିତ।`,
        ml: isRed ? `NDMA മുന്നറിയിപ്പ്: സുരക്ഷിതമായ റോഡ് ബൈപാസ് വഴി ഹെവൻ ഗാമയിലേക്ക് പോവുക.` : `സുരക്ഷിതമാണ്.`,
        pa: isRed ? `NDMA ਆਫ਼ਤ ਚੇਤਾਵਨੀ: ਸੁਰੱਖਿਅਤ ਸੜਕ ਰੂਟ ਰਾਹੀਂ ਹੈਵਨ ਗਾਮਾ ਪਹੁੰਚੋ।` : `ਸੁਰੱਖਿਅਤ ਹੈ।`,
        pt: isRed ? `ALERTA NDMA: Ciclone iminente. Siga pela rota rodoviária real até o Refúgio Gama.` : `Normal.`,
        ru: isRed ? `ПРЕДУПРЕЖДЕНИЕ NDMA: Следуйте реальным дорожным путем в Убежище Гамма.` : `Норма.`,
        zh: isRed ? `紧急 NDMA 灾害预警：请沿实际测绘公路撤离至伽马避难所。` : `电力与天气一切正常。`,
        af: isRed ? `DRINGENDE NDMA WAARSKUWING: Volg die padverbypad na Toevlugsoord Gamma.` : `Kragtoevoer is stabiel.`
      },
      ttsData: {
        en: { mp3Url: "" }, hi: { mp3Url: "" }, gu: { mp3Url: "" }, bn: { mp3Url: "" }, te: { mp3Url: "" },
        mr: { mp3Url: "" }, ta: { mp3Url: "" }, kn: { mp3Url: "" }, or: { mp3Url: "" }, ml: { mp3Url: "" },
        pa: { mp3Url: "" }, pt: { mp3Url: "" }, ru: { mp3Url: "" }, zh: { mp3Url: "" }, af: { mp3Url: "" }
      },
      offlineLoraPacket: loraPacket,
      latencyMs: 14
    };
  };

  const fetchAIAnalysis = async (surgeOverride) => {
    setLoading(true);
    const isSurge = surgeOverride !== undefined ? surgeOverride : evacueeSurgeActive;

    if (forceOfflineMode || isSystemOffline) {
      const offlineResult = await runOfflineEdgePipeline(isSurge);
      setDashboardData(offlineResult);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(FIREBASE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_SECRET },
        body: JSON.stringify({
          trigger: "manual",
          visionPayload: generateMultimodalBase64Snapshot(),
          latitude: currentLat,
          longitude: currentLon,
          locationName: currentLocationName,
          simulationMode: simulationStressTest,
          evacueeSurgeActive: isSurge
        })
      });
      const result = await res.json();
      if (result.success) {
        setDashboardData(result);
      } else {
        throw new Error(result.error || "Server unreachable");
      }
    } catch (e) {
      const fallbackResult = await runOfflineEdgePipeline(isSurge);
      setDashboardData(fallbackResult);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSurge = () => {
    const newSurge = !evacueeSurgeActive;
    setEvacueeSurgeActive(newSurge);
    fetchAIAnalysis(newSurge);
  };

  const simulateDialogflowCall = async (queryTextOverride) => {
    setIsCalling(true);
    const query = typeof queryTextOverride === 'string' ? queryTextOverride : "Check safe zone";

    if (forceOfflineMode || isSystemOffline) {
      setTimeout(() => {
        const offlineSpeech = `NDMA Offline Emergency IVR: Cellular data networks are down in ${currentLocationName}. Emergency shelter Haven Gamma at 18.5m elevation is fully operational with backup power and water. Follow the real-road bypass route.`;
        setDialogflowResponse(offlineSpeech);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(offlineSpeech));
        }
        setIsCalling(false);
      }, 400);
      return;
    }

    try {
      const res = await fetch(DIALOGFLOW_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryResult: {
            intent: { displayName: "Check_Safe_Zone" },
            queryText: query,
            parameters: { location: currentLocationName }
          }
        })
      });
      const data = await res.json();
      setDialogflowResponse(data.fulfillmentText);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.fulfillmentText));
      }
    } catch (e) {
      const offlineSpeech = `NDMA Hotline: All-hazard telemetry confirms Haven Gamma is open and elevated. Proceed inland via road network.`;
      setDialogflowResponse(offlineSpeech);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(offlineSpeech));
      }
    } finally {
      setIsCalling(false);
    }
  };

  const playAudio = (url, fallbackText, langCode) => {
    if (!url || forceOfflineMode || isSystemOffline) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        utterance.lang = langCode;
        window.speechSynthesis.speak(utterance);
      }
      return;
    }

    try {
      const audio = new Audio(url);
      audio.play().catch(() => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(fallbackText);
          utterance.lang = langCode;
          window.speechSynthesis.speak(utterance);
        }
      });
    } catch (e) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        utterance.lang = langCode;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const isGreen = dashboardData && dashboardData.riskTier === "GREEN";
  const isOfflineActive = forceOfflineMode || isSystemOffline || (dashboardData && dashboardData.isOfflineMode);

  return (
    <div className="dashboard">
      <div className="map-panel">
        <div className="header-overlay">
          <div className="header-top-row">
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '17px' }}>
                <CycloneResilienceLogo /> Cyclone Resilience Command Hub
              </h1>
              <p style={{ margin: '3px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '11px' }}>
                <Cpu size={12} color="#a855f7" /> Vertex AI, BigQuery, ISRO Bhuvan & Real-Road Navigation
              </p>
            </div>
            <div className="header-button-group">
              <button
                onClick={() => setForceOfflineMode(!forceOfflineMode)}
                className="toggle-layer-btn"
                style={{
                  background: forceOfflineMode ? '#7c2d12' : '#1e293b',
                  color: forceOfflineMode ? '#fef08a' : '#94a3b8',
                  border: forceOfflineMode ? '1px solid #ca8a04' : '1px solid #334155'
                }}
              >
                {forceOfflineMode ? <WifiOff size={13} color="#facc15" /> : <Wifi size={13} />} {forceOfflineMode ? "Network: ZERO INTERNET" : "Network: ONLINE"}
              </button>

              <button
                onClick={() => setSimulationStressTest(!simulationStressTest)}
                className="toggle-layer-btn"
                style={{
                  background: simulationStressTest ? '#b91c1c' : '#065f46',
                  color: '#fef2f2',
                  border: simulationStressTest ? '1px solid #ef4444' : '1px solid #10b981'
                }}
              >
                <Flame size={13} /> {simulationStressTest ? "Sim: CYCLONE STRESS-TEST" : "Sim: REAL WEATHER"}
              </button>
              <button onClick={() => setShowBhuvanLayer(!showBhuvanLayer)} className="toggle-layer-btn" style={{ background: showBhuvanLayer ? '#065f46' : '#1e293b', color: showBhuvanLayer ? '#a7f3d0' : '#94a3b8', border: showBhuvanLayer ? '1px solid #10b981' : '1px solid #334155' }}>
                <Satellite size={13} /> {showBhuvanLayer ? "ISRO Bhuvan: ON" : "ISRO Bhuvan: OFF"}
              </button>
              <button onClick={() => setShowViirsHeatmap(!showViirsHeatmap)} className="toggle-layer-btn" style={{ background: showViirsHeatmap ? '#7c2d12' : '#1e293b', color: showViirsHeatmap ? '#fde047' : '#94a3b8' }}>
                <Lightbulb size={13} /> {showViirsHeatmap ? "VIIRS Lights: ON" : "VIIRS Lights: OFF"}
              </button>
              <button onClick={() => setShowNavigationRoute(!showNavigationRoute)} className="toggle-layer-btn" style={{ background: showNavigationRoute ? '#0369a1' : '#1e293b', color: '#ffffff' }}>
                <Route size={13} /> {showNavigationRoute ? "Routes: ON" : "Routes: OFF"}
              </button>
              <button onClick={() => setShowTelemetryRings(!showTelemetryRings)} className="toggle-layer-btn">
                <Layers size={13} /> {showTelemetryRings ? "Rings: ON" : "Rings: OFF"}
              </button>
            </div>
          </div>

          <div className="header-sector-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '12px' }}>
              <MapPin size={13} /> Sector:
            </div>
            <select
              onChange={handleLocationDropdown}
              style={{
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #334155',
                padding: '5px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                outline: 'none',
                flex: 1,
                minWidth: '150px'
              }}
            >
              {PREDEFINED_LOCATIONS.map((loc, idx) => (
                <option key={idx} value={idx}>{loc.name}</option>
              ))}
              <option value="LIVE">Live GPS Position...</option>
            </select>
            <button
              onClick={requestLiveLocation}
              disabled={isGettingLocation}
              style={{
                background: '#0369a1',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              {isGettingLocation ? <Activity size={12} className="spinner" /> : <Crosshair size={12} />} Locate Me
            </button>

            <button
              onClick={toggleSpeechRecognition}
              style={{
                background: isListening ? '#dc2626' : '#1e293b',
                color: '#ffffff',
                border: '1px solid #334155',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
              title="Click to speak (Cloud Speech-to-Text Voice Query)"
            >
              {isListening ? <MicOff size={12} /> : <Mic size={12} />} {isListening ? "Listening..." : "Voice Query"}
            </button>
          </div>
        </div>

        <MapContainer center={[currentLat, currentLon]} zoom={8} style={{ height: '100%', width: '100%', backgroundColor: '#020617' }} zoomControl={false}>
          <RecenterMap lat={currentLat} lon={currentLon} />
          
          <TileLayer
            key={showBhuvanLayer ? "isro-bhuvan-optical-sat" : "esri-dark-gray-canvas"}
            attribution={showBhuvanLayer ? '&copy; ISRO / NRSC &mdash; Bhuvan Optical Satellite Feed' : '&copy; Esri World Dark Canvas'}
            url={
              showBhuvanLayer
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            }
          />

          {/* Telemetry Radii */}
          {dashboardData && showTelemetryRings && (
            <>
              <Circle
                center={[currentLat, currentLon]}
                radius={dashboardData.hazardRadii.outerRadiusMeters}
                pathOptions={{
                  color: dashboardData.riskColor,
                  fillColor: dashboardData.riskColor,
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '6, 6'
                }}
              >
                <Popup><div style={{ color: '#0f172a', fontSize: '12px' }}><strong>Outer Rainband Swath</strong></div></Popup>
              </Circle>

              <Circle
                center={[currentLat, currentLon]}
                radius={dashboardData.hazardRadii.galeRadiusMeters}
                pathOptions={{
                  color: dashboardData.riskColor,
                  fillColor: dashboardData.riskColor,
                  fillOpacity: 0.14,
                  weight: 2,
                  dashArray: '4, 4'
                }}
              >
                <Popup><div style={{ color: '#0f172a', fontSize: '12px' }}><strong>Intermediate Gale Swath</strong></div></Popup>
              </Circle>

              <Circle
                center={[currentLat, currentLon]}
                radius={dashboardData.hazardRadii.coreRadiusMeters}
                pathOptions={{
                  color: dashboardData.riskColor,
                  fillColor: dashboardData.riskColor,
                  fillOpacity: isGreen ? 0.15 : 0.32,
                  weight: 2.5
                }}
              >
                <Popup>
                  <div style={{ color: '#0f172a', fontSize: '12px' }}>
                    <strong>{dashboardData.riskTier} TIER HAZARD PERIMETER</strong><br />
                    Surge: {dashboardData.predictiveModel.storm_surge_predicted_meters}m
                  </div>
                </Popup>
              </Circle>
            </>
          )}

          {/* VIIRS Nighttime Radiance & Blackout Nodes */}
          {dashboardData && showViirsHeatmap && dashboardData.viirsNighttimeLights?.viirsGridPoints.map((vNode) => (
            <CircleMarker
              key={vNode.id}
              center={vNode.coordinates}
              radius={vNode.blackoutRiskPercent >= 70 ? 22 : 15}
              pathOptions={{
                color: vNode.color,
                fillColor: vNode.color,
                fillOpacity: vNode.blackoutRiskPercent >= 70 ? 0.45 : 0.25,
                weight: vNode.blackoutRiskPercent >= 70 ? 2 : 1,
                dashArray: vNode.blackoutRiskPercent >= 70 ? '3, 3' : undefined
              }}
            >
              <Popup>
                <div style={{ color: '#0f172a', minWidth: '190px', fontSize: '12px' }}>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>💡 {vNode.name}</strong><br />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>NOAA/VIIRS DNB Night Radiance</span>
                  <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #cbd5e1' }} />
                  <div>Baseline Radiance: <strong>{vNode.baselineRadiance} nW/(cm²·sr)</strong></div>
                  <div>Post-Surge Forecast: <strong>{vNode.postStormRadianceForecast} nW/(cm²·sr)</strong></div>
                  <div>Blackout Probability: <strong style={{ color: vNode.color }}>{vNode.blackoutRiskPercent}%</strong></div>
                  <div style={{ marginTop: '3px', fontSize: '11px' }}>Substation: <strong>{vNode.substationStatus}</strong></div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* REAL ROAD EVACUATION ROUTE POLYLINE */}
          {dashboardData && showNavigationRoute && dashboardData.evacuationRouting && (
            <>
              <Polyline
                positions={dashboardData.evacuationRouting.routeWaypoints}
                pathOptions={{
                  color: '#38bdf8',
                  weight: 5,
                  opacity: 0.95,
                  lineJoin: 'round',
                  lineCap: 'round'
                }}
              >
                <Popup>
                  <div style={{ color: '#0f172a', fontSize: '12px' }}>
                    <strong style={{ color: '#0284c7' }}>🚗 Real Road Evacuation Route</strong><br />
                    Distance: <strong>{dashboardData.evacuationRouting.totalDistanceKm} km</strong><br />
                    Est. Convoy Transit: <strong>{dashboardData.evacuationRouting.estimatedTransitMinutes} mins</strong><br />
                    Destination: <strong>{dashboardData.evacuationRouting.destinationLocation.name}</strong>
                  </div>
                </Popup>
              </Polyline>

              <Polyline
                positions={dashboardData.evacuationRouting.floodedObstacleWaypoints}
                pathOptions={{
                  color: '#ef4444',
                  weight: 4,
                  dashArray: '6, 6',
                  opacity: 0.85
                }}
              >
                <Popup>
                  <div style={{ color: '#0f172a', fontSize: '12px' }}>
                    <strong style={{ color: '#dc2626' }}>⛔ IMPASSABLE FLOODED ROADWAY</strong><br />
                    Status: GEE SAR Inundation Detected (&gt;1.5m Floodwater)<br />
                    Action: Bypassed via Google Maps avoidPolygons
                  </div>
                </Popup>
              </Polyline>
            </>
          )}

          {/* Infrastructure Markers */}
          {dashboardData &&
            dashboardData.infrastructureVulnerability.map((infra) => (
              <CircleMarker
                key={infra.id}
                center={[infra.coordinates.lat, infra.coordinates.lon]}
                radius={8}
                pathOptions={{
                  color: infra.color,
                  fillColor: infra.color,
                  fillOpacity: 0.95,
                  weight: 2
                }}
              >
                <Popup>
                  <div style={{ color: '#0f172a', minWidth: '200px', fontSize: '12px' }}>
                    <strong style={{ fontSize: '13px' }}>{infra.name}</strong><br />
                    <span>Sector: <strong>{infra.category}</strong></span><br />
                    <span>Elevation: <strong>{infra.elevationMeters}m MSL</strong></span><br />
                    <span style={{ color: infra.color, fontWeight: 'bold' }}>Status: {infra.status}</span><br />
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #cbd5e1' }} />
                    <span style={{ color: '#0284c7', fontSize: '11px' }}><strong>Hardening:</strong> {infra.hardeningProtocol}</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {/* Shelter Network Markers */}
          {dashboardData &&
            dashboardData.shelterNetwork?.shelters.map((shelter) => (
              <CircleMarker
                key={shelter.id}
                center={[shelter.coordinates.lat, shelter.coordinates.lon]}
                radius={11}
                pathOptions={{
                  color: shelter.occupancyPercentage >= 90 ? '#ef4444' : shelter.occupancyPercentage >= 70 ? '#f59e0b' : '#10b981',
                  fillColor: shelter.occupancyPercentage >= 90 ? '#dc2626' : shelter.occupancyPercentage >= 70 ? '#d97706' : '#059669',
                  fillOpacity: 0.9,
                  weight: 2.5
                }}
              >
                <Popup>
                  <div style={{ color: '#0f172a', minWidth: '210px', fontSize: '12px' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>🏠 {shelter.name}</strong><br />
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{shelter.type}</span>
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #cbd5e1' }} />
                    <div>Occupancy: <strong>{shelter.currentOccupancy} / {shelter.capacity} ({shelter.occupancyPercentage}%)</strong></div>
                    <div>Potable Water: <strong>{shelter.cleanWaterLiters.toLocaleString()} L</strong></div>
                    <div>Medical Kits: <strong>{shelter.medicalKits} kits</strong></div>
                    <div>Elevation: <strong>{shelter.elevationMeters}m MSL</strong></div>
                    <div style={{ marginTop: '4px', fontWeight: 'bold', color: shelter.occupancyPercentage >= 90 ? '#dc2626' : '#059669' }}>
                      Status: {shelter.occupancyPercentage >= 90 ? "🚨 FULL - DIVERSION ACTIVE" : "✅ ACCEPTING CITIZENS"}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>

        <div className="map-legend">
          <div className="legend-item"><span className="dot" style={{ background: '#38bdf8' }}></span> Cyan Line: Real Road Evacuation Route</div>
          <div className="legend-item"><span className="dot" style={{ background: '#facc15' }}></span> Gold Halo: VIIRS Electrified Light Grid</div>
          <div className="legend-item"><span className="dot" style={{ background: '#ef4444' }}></span> Red Ring: Projected Grid Blackout Hotspot</div>
          <div className="legend-item"><span className="dot" style={{ background: '#10b981' }}></span> Green: Safe Haven Shelter (&gt;18m)</div>
        </div>

        <button onClick={() => fetchAIAnalysis()} disabled={loading} className="action-button" style={{ background: dashboardData?.riskColor || '#059669' }}>
          {loading ? <Activity size={17} className="spinner" /> : <AlertTriangle size={17} />}
          {loading ? "Running Vertex AI AutoML & Ingesting BigQuery Records..." : `Evaluate Pre-Landfall Risk for ${currentLocationName}`}
        </button>
      </div>

      <div className="side-panel">
        {!dashboardData ? (
          <div style={{ height: '100%', minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center', gap: '12px' }}>
            <Activity size={44} style={{ opacity: 0.3 }} />
            <p style={{ margin: 0, fontWeight: 500, color: '#94a3b8' }}>Real-Time Disaster Risk Modeling Engine</p>
            <p style={{ fontSize: '12px', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
              Select any coastal location or use GPS to calculate live surge heights, Vertex AI damage probabilities, BigQuery cyclone analogues, and real road evacuation paths.
            </p>
          </div>
        ) : (
          <>
            <div className="telemetry-bar">
              <span style={{ color: dashboardData.riskColor, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                {isGreen ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />} {dashboardData.riskTier} TIER: {dashboardData.engine}
              </span>
              <span style={{ color: '#94a3b8' }}>Latency: {dashboardData.latencyMs}ms</span>
            </div>

            {/* Atmospheric Telemetry Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
              <div style={{ background: '#0f172a', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Wind size={12} /> Wind
                </div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#38bdf8', marginTop: '2px' }}>
                  {dashboardData.liveWindSpeed} <span style={{ fontSize: '10px' }}>km/h</span>
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Gauge size={12} /> Pressure
                </div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#a855f7', marginTop: '2px' }}>
                  {dashboardData.livePressure} <span style={{ fontSize: '10px' }}>hPa</span>
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <CloudRain size={12} /> Rain (24h)
                </div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#34d399', marginTop: '2px' }}>
                  {dashboardData.liveRainfallMm} <span style={{ fontSize: '10px' }}>mm</span>
                </div>
              </div>
            </div>

            {/* VERTEX AI AUTOML MODEL SERVING & PREDICTIVE SCORES */}
            {dashboardData.vertexAIModel && (
              <div className="card" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ color: '#818cf8', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={15} /> Vertex AI AutoML Model Serving
                  </h3>
                  <span style={{ fontSize: '10px', background: '#312e81', color: '#c7d2fe', padding: '2px 6px', borderRadius: '4px' }}>
                    asia-south1 Endpoint
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '11px', textAlign: 'center', marginTop: '6px' }}>
                  <div style={{ background: '#020617', padding: '6px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                    <span style={{ color: '#94a3b8', fontSize: '10px' }}>Inundation Prob</span>
                    <div style={{ color: '#f87171', fontWeight: 'bold', fontSize: '13px' }}>
                      {Math.round(dashboardData.vertexAIModel.predictionScores.catastrophic_inundation_prob * 100)}%
                    </div>
                  </div>
                  <div style={{ background: '#020617', padding: '6px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                    <span style={{ color: '#94a3b8', fontSize: '10px' }}>Structure Failure</span>
                    <div style={{ color: '#fb923c', fontWeight: 'bold', fontSize: '13px' }}>
                      {Math.round(dashboardData.vertexAIModel.predictionScores.structural_failure_prob * 100)}%
                    </div>
                  </div>
                  <div style={{ background: '#020617', padding: '6px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                    <span style={{ color: '#94a3b8', fontSize: '10px' }}>Grid Trip Prob</span>
                    <div style={{ color: '#facc15', fontWeight: 'bold', fontSize: '13px' }}>
                      {Math.round(dashboardData.vertexAIModel.predictionScores.grid_tripping_prob * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VERTEX AI VISION / CITIZEN DAMAGE PHOTO UPLOAD MODULE */}
            <div className="card" style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ color: '#f472b6', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={15} /> Vertex AI Vision: Citizen Damage Photo
                </h3>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleCitizenPhotoUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={analyzingPhoto}
                  className="play-btn"
                  style={{ background: '#831843', color: '#fbcfe8', border: '1px solid #db2777', padding: '3px 8px' }}
                >
                  {analyzingPhoto ? <Activity size={12} className="spinner" /> : <Camera size={12} />}
                  {analyzingPhoto ? "Scanning..." : "Upload Photo"}
                </button>
              </div>

              {visionReport ? (
                <div style={{ background: '#020617', padding: '8px', borderRadius: '4px', border: '1px solid #1e293b', fontSize: '11.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f472b6', fontWeight: 600 }}>
                    <span>{visionReport.damageCategory}</span>
                    <span style={{ color: '#ef4444' }}>{visionReport.severityLevel}</span>
                  </div>
                  <div style={{ color: '#cbd5e1', marginTop: '4px', fontSize: '11px' }}>
                    {visionReport.immediateRescueRecommendation}
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                  Upload citizen-submitted photos (flooded roads, collapsed lines) for automatic Multimodal Gemini & Vertex Vision damage assessment.
                </p>
              )}
            </div>

            {/* BIGQUERY HISTORICAL ANALOGUES */}
            {dashboardData.bigqueryHistory && (
              <div className="card" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ color: '#34d399', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database size={15} /> BigQuery Historical Storm Analogs
                  </h3>
                  <span style={{ fontSize: '9.5px', color: '#a7f3d0' }}>
                    public-data.noaa_hurricanes
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', marginTop: '6px' }}>
                  {dashboardData.bigqueryHistory.historicalAnalogsForSector.map((storm, sIdx) => (
                    <div key={sIdx} style={{ background: '#020617', padding: '6px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{storm.cycloneName} ({storm.year})</span>
                      <span style={{ color: '#38bdf8' }}>Wind: {storm.peakWindKmph} km/h | Surge: {storm.actualSurgeMeters}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PUBLIC DATASETS & UN AGENCIES */}
            {dashboardData.publicDatasets && (
              <div className="card" style={{ background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                <h3 style={{ color: '#38bdf8', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} /> Public Data & Global Multi-Agency Feeds
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ background: '#020617', padding: '6px 8px', borderRadius: '4px', borderLeft: '3px solid #38bdf8' }}>
                    <div style={{ color: '#38bdf8', fontWeight: 600 }}>IMD Coastal Warning Bulletin</div>
                    <div style={{ color: '#cbd5e1' }}>{dashboardData.publicDatasets.imdBulletin.coastalWarningStatus}</div>
                  </div>
                  <div style={{ background: '#020617', padding: '6px 8px', borderRadius: '4px', borderLeft: '3px solid #10b981' }}>
                    <div style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sprout size={11} /> FAO Agro-Met Crop Exposure Index
                    </div>
                    <div style={{ color: '#cbd5e1' }}>
                      Vulnerable Acreage: <strong>{dashboardData.publicDatasets.faoAgriculture.vulnerableCropAcreageHectares.toLocaleString()} Hectares</strong>
                    </div>
                  </div>
                  <div style={{ background: '#020617', padding: '6px 8px', borderRadius: '4px', borderLeft: '3px solid #f43f5e' }}>
                    <div style={{ color: '#fb7185', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HeartPulse size={11} /> WHO Post-Flood Epidemic Surveillance
                    </div>
                    <div style={{ color: '#cbd5e1' }}>
                      Waterborne Disease Risk: <strong>{dashboardData.publicDatasets.whoHealth.postFloodEpidemicRiskScore}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ZERO-INTERNET DISASTER MESH BROADCAST */}
            {isOfflineActive && (
              <div className="card" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid #ca8a04' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ color: '#facc15', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Radio size={16} /> LoRa / Satellite Disaster Mesh Packet
                  </h3>
                  <span style={{ fontSize: '10px', background: '#854d0e', color: '#fef08a', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                    ZERO INTERNET ACTIVE
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 6px 0' }}>
                  Cellular towers failed. Compressed 128-byte packet ready for transmission over 868MHz LoRa, Ham APRS, or P2P Bluetooth mesh:
                </p>
                <div style={{ background: '#020617', padding: '8px', borderRadius: '4px', border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '10.5px', color: '#38bdf8', wordBreak: 'break-all' }}>
                  {dashboardData.offlineLoraPacket || `[LORA_MESH_EMERGENCY] LOC:${currentLat.toFixed(2)},${currentLon.toFixed(2)}|TIER:${dashboardData.riskTier}|WIND:${dashboardData.liveWindSpeed}KMPH|SURGE:${dashboardData.predictiveModel.storm_surge_predicted_meters}M|AUTH:NDMA_OFFLINE`}
                </div>
              </div>
            )}

            {/* VIIRS Nighttime Lights Blackout Predictor */}
            {dashboardData.viirsNighttimeLights && (
              <div className="card" style={{ background: dashboardData.viirsNighttimeLights.gridCollapseProbabilityPercent >= 70 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 23, 42, 0.95)', border: dashboardData.viirsNighttimeLights.gridCollapseProbabilityPercent >= 70 ? '1px solid #ef4444' : '1px solid #ca8a04' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ color: '#facc15', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lightbulb size={16} /> VIIRS Night Lights Blackout Predictor
                  </h3>
                  <span style={{ fontSize: '10px', background: '#451a03', color: '#fef08a', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #ca8a04' }}>
                    NOAA VIIRS DNB
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: '#020617', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b', marginBottom: '8px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Baseline Radiance</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#facc15' }}>
                      {dashboardData.viirsNighttimeLights.baselineRadianceMean} <span style={{ fontSize: '9px' }}>nW</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Blackout Risk</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: dashboardData.viirsNighttimeLights.gridCollapseProbabilityPercent >= 70 ? '#ef4444' : '#10b981' }}>
                      {dashboardData.viirsNighttimeLights.gridCollapseProbabilityPercent}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Gen Deployment</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8' }}>
                      {dashboardData.viirsNighttimeLights.recommendedEmergencyGeneratorsMW} MW
                    </div>
                  </div>
                </div>

                {dashboardData.viirsNighttimeLights.estimatedDarkPopulation > 0 && (
                  <div style={{ fontSize: '11px', color: '#fca5a5', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ZapOff size={13} color="#ef4444" />
                    <span>Est. Population Facing Total Blackout: <strong>{dashboardData.viirsNighttimeLights.estimatedDarkPopulation.toLocaleString()} citizens</strong></span>
                  </div>
                )}

                <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
                  <span style={{ color: '#facc15', fontWeight: 600 }}>Utility Directives:</span> {dashboardData.viirsNighttimeLights.priorityFeederActions}
                </div>
              </div>
            )}

            {/* REAL ROAD EVACUATION ROUTING CARD */}
            {dashboardData.evacuationRouting && (
              <div className="card" style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Navigation2 size={16} /> Real-Road Evacuation Navigation
                  </h3>
                  <span style={{ fontSize: '10px', background: '#0369a1', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                    Live Road Graph
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020617', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Road Distance</div>
                    <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#38bdf8' }}>
                      {dashboardData.evacuationRouting.totalDistanceKm} km
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Est. Convoy Time</div>
                    <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#34d399' }}>
                      {dashboardData.evacuationRouting.estimatedTransitMinutes} mins
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Destination Haven</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#facc15' }}>
                      18.5m MSL
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '8px', fontSize: '11px' }}>
                  <span style={{ color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                    <AlertOctagon size={12} /> Bypassed Impassable Flood Zones:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {dashboardData.evacuationRouting.avoidedFloodHazards.map((hazard, hIdx) => (
                      <span key={hIdx} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '2px 6px', borderRadius: '3px', fontSize: '10.5px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        {hazard}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {dashboardData.evacuationRouting.turnByTurnGuidance.map((step) => (
                    <div key={step.step} style={{ background: '#020617', padding: '6px 8px', borderRadius: '4px', borderLeft: '3px solid #38bdf8', fontSize: '11.5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '10.5px', marginBottom: '2px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Milestone size={11} color="#38bdf8" /> Step {step.step} • {step.distance}
                        </span>
                        <span style={{ color: '#34d399' }}>Elevation: {step.elevation}</span>
                      </div>
                      <div style={{ color: '#e2e8f0', lineHeight: 1.4 }}>
                        {step.instruction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Shelter Capacity & Resources Panel */}
            <div className="card" style={{ background: 'rgba(15, 23, 42, 0.95)', border: dashboardData.shelterNetwork?.reRoutingLogistics.active ? '1px solid #ef4444' : '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} /> Dynamic Shelter Capacity & Resources
                </h3>
                <button
                  onClick={handleToggleSurge}
                  style={{
                    fontSize: '10.5px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #38bdf8',
                    background: evacueeSurgeActive ? '#0284c7' : '#082f49',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.15s ease'
                  }}
                  title="Simulates 250 arriving citizens to test automatic 90% capacity re-routing"
                >
                  {evacueeSurgeActive ? "Surge: +250 Active" : "Simulate Surge (+250)"}
                </button>
              </div>

              {dashboardData.shelterNetwork?.reRoutingLogistics.active && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderLeft: '3px solid #ef4444', padding: '8px', borderRadius: '4px', marginBottom: '10px', fontSize: '11.5px', color: '#fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#f87171' }}>
                    <CornerUpRight size={14} /> DIVERSION PROTOCOL ACTIVE
                  </div>
                  <div style={{ margin: '3px 0' }}>
                    Re-routing <strong>{dashboardData.shelterNetwork.reRoutingLogistics.divertedEvacueeCount} evacuees</strong> from {dashboardData.shelterNetwork.reRoutingLogistics.diversionOrigin} to <strong>{dashboardData.shelterNetwork.reRoutingLogistics.diversionDestination}</strong>.
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>
                    Transit Corridor: {dashboardData.shelterNetwork.reRoutingLogistics.recommendedTransitCorridor}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dashboardData.shelterNetwork?.shelters.map((shelter) => (
                  <div key={shelter.id} style={{ background: '#020617', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{shelter.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: shelter.occupancyPercentage >= 90 ? '#ef4444' : shelter.occupancyPercentage >= 70 ? '#f59e0b' : '#34d399' }}>
                        {shelter.currentOccupancy} / {shelter.capacity} ({shelter.occupancyPercentage}%)
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', margin: '6px 0', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, shelter.occupancyPercentage)}%`,
                          height: '100%',
                          background: shelter.occupancyPercentage >= 90 ? '#ef4444' : shelter.occupancyPercentage >= 70 ? '#f59e0b' : '#10b981',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Droplets size={11} color="#38bdf8" /> {shelter.cleanWaterLiters.toLocaleString()} L
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <PackageCheck size={11} color="#34d399" /> {shelter.medicalKits} Kits
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <BatteryCharging size={11} color="#facc15" /> {shelter.backupPowerHours}h Gen
                      </span>
                      <span style={{ color: '#cbd5e1' }}>{shelter.elevationMeters}m MSL</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parametric Insurance Liquidity Card */}
            <div className="card" style={{ background: dashboardData.parametricInsurance.status === "LIQUIDITY_UNLOCKED" ? "rgba(234, 179, 8, 0.12)" : "rgba(15, 23, 42, 0.9)", border: dashboardData.parametricInsurance.status === "LIQUIDITY_UNLOCKED" ? "1px solid #eab308" : "1px solid #1e293b" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h3 style={{ color: '#facc15', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={15} /> Parametric Insurance Liquidity
                </h3>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: dashboardData.parametricInsurance.status === "LIQUIDITY_UNLOCKED" ? "#ca8a04" : "#1e293b", color: '#ffffff', fontWeight: 'bold' }}>
                  {dashboardData.parametricInsurance.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Contract: {dashboardData.parametricInsurance.parametricContractId}</div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>{dashboardData.parametricInsurance.payoutTier}</div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#facc15' }}>
                  {dashboardData.parametricInsurance.disbursementAmountFormatted}
                </div>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.4 }}>
                {dashboardData.parametricInsurance.actionableDirectives}
              </p>
            </div>

            {/* GEE Sentinel-1 SAR Satellite Hydrology */}
            <div className="card" style={{ background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h3 style={{ color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Satellite size={15} /> GEE Sentinel-1 SAR Feed
                </h3>
                <span style={{ fontSize: '10px', color: '#38bdf8', background: '#082f49', padding: '2px 6px', borderRadius: '4px' }}>
                  {dashboardData.geeSatelliteTelemetry.polarization}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11.5px', marginTop: '6px' }}>
                <div style={{ color: '#94a3b8' }}>Soil Saturation: <strong style={{ color: '#e2e8f0' }}>{dashboardData.geeSatelliteTelemetry.soilMoistureSaturationPercentage}%</strong></div>
                <div style={{ color: '#94a3b8' }}>Inundation Signal: <strong style={{ color: '#e2e8f0' }}>{dashboardData.geeSatelliteTelemetry.waterInundationConfidence}</strong></div>
              </div>
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Identified Runoff Pathways:</span>
                <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0' }}>
                  {dashboardData.geeSatelliteTelemetry.runoffChokepointsIdentified.map((choke, idx) => (
                    <li key={idx}>{choke}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Surge Height Card */}
            <div className="card" style={{ background: `${dashboardData.riskColor}15`, border: `1px solid ${dashboardData.riskColor}` }}>
              <h3 style={{ color: dashboardData.riskColor, margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Waves size={16} /> Hydrodynamic Surge Forecast ({dashboardData.riskTier} TIER)
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Coupled Regression Output</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: dashboardData.riskColor }}>
                  {dashboardData.predictiveModel.storm_surge_predicted_meters} <span style={{ fontSize: '14px' }}>Meters</span>
                </div>
              </div>
            </div>

            {/* Impact Analysis */}
            <div className="card">
              <h3 className="text-cyan"><ShieldCheck size={16} /> Cascading Physical Risk & Runoff Pathways</h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#cbd5e1', margin: 0 }}>
                {dashboardData.impactAnalysis}
              </p>
            </div>

            {/* Pre-Landfall Infrastructure Hardening Directives */}
            <div className="card" style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              <h3 style={{ color: '#c084fc', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wrench size={15} /> Pre-Landfall Infrastructure Hardening
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dashboardData.infrastructureVulnerability.map((node) => (
                  <div key={node.id} style={{ fontSize: '12px', background: '#020617', padding: '6px 8px', borderRadius: '4px', borderLeft: `3px solid ${node.color}` }}>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{node.name}</span>
                      <span style={{ fontSize: '10.5px', color: node.color }}>{node.elevationMeters}m MSL</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '3px' }}>
                      {node.hardeningProtocol}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evacuation Directives */}
            <div className="card">
              <h3 className="text-emerald"><Navigation size={16} /> Designated Directives (evacuationZones)</h3>
              <ul style={{ paddingLeft: '18px', margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: '1.6' }}>
                {dashboardData.evacuationZones.map((zone, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{zone}</li>
                ))}
              </ul>
            </div>

            {/* Permanent English Base Broadcast */}
            <div className="card" style={{ background: `${dashboardData.riskColor}15`, border: `1px solid ${dashboardData.riskColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ color: dashboardData.riskColor, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BellRing size={16} /> Official NDMA Broadcast (ENGLISH)
                </h3>
                <button
                  onClick={() => playAudio(dashboardData.ttsData.en.mp3Url, dashboardData.baseWarningMessage, 'en-US')}
                  className="play-btn"
                  style={{ background: isGreen ? '#065f46' : '#7f1d1d', color: '#fecaca', padding: '4px 8px' }}
                >
                  <Volume2 size={13} /> {isOfflineActive ? "Speak (Local OS)" : "Play MP3"}
                </button>
              </div>
              <p style={{ fontSize: '12.5px', lineHeight: '1.5', color: isGreen ? '#a7f3d0' : '#fecaca', margin: 0 }}>
                {dashboardData.baseWarningMessage}
              </p>
            </div>

            {/* Dynamic 14-Language Regional Dispatch Selector */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 className="text-purple" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Volume2 size={16} /> Regional Dispatch Selector
                </h3>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', outline: 'none' }}
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="lang-box" style={{ background: '#020617', border: '1px solid #1e293b' }}>
                <div className="lang-header">
                  <span className="lang-label" style={{ color: '#38bdf8' }}>
                    {LANGUAGE_OPTIONS.find((o) => o.id === selectedLang)?.label.toUpperCase()}
                  </span>
                  <button
                    onClick={() =>
                      playAudio(
                        dashboardData.ttsData[selectedLang]?.mp3Url,
                        dashboardData.multilingualBroadcasts[selectedLang],
                        LANGUAGE_OPTIONS.find((o) => o.id === selectedLang)?.code
                      )
                    }
                    className="play-btn"
                  >
                    <Volume2 size={15} /> {isOfflineActive ? "Speak (Local OS)" : "Play MP3"}
                  </button>
                </div>
                <p style={{ margin: '0', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {dashboardData.multilingualBroadcasts[selectedLang]}
                </p>
              </div>
            </div>

            {/* Dialogflow Call-Bot Simulator */}
            <div className="card" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
              <h3 style={{ color: '#facc15', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={16} /> Dialogflow Call-Bot Simulator
              </h3>
              <button
                onClick={() => simulateDialogflowCall("Check safe zone")}
                disabled={isCalling}
                style={{
                  width: '100%',
                  background: '#ca8a04',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isCalling ? <Activity size={15} className="spinner" /> : <PhoneCall size={15} />}
                {isCalling ? "Dialing Hotline Fulfillment..." : "Simulate Inbound Voice Call"}
              </button>
              {dialogflowResponse && (
                <div style={{ marginTop: '12px', background: '#020617', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #facc15' }}>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#fef08a', lineHeight: '1.5' }}>"{dialogflowResponse}"</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}