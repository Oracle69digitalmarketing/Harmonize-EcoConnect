import { useState, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sprout, 
  Activity, 
  Settings, 
  WifiOff, 
  BatteryMedium, 
  Sun, 
  ChevronRight, 
  AlertTriangle, 
  CloudRain, 
  Database,
  ArrowRightLeft,
  User,
  History,
  TrendingUp,
  Stethoscope,
  Heart
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { dataStore, AgriLog, HealthRecord } from "@/src/services/dataService";
import { predictCropYield, triageSymptoms } from "@/src/services/aiService";
import { MiniVisuals } from "@/src/components/common/MiniVisuals";

type Mode = "agri" | "health" | "startup";

export default function App() {
  const [mode, setMode] = useState<Mode>("startup");
  const [agriLogs, setAgriLogs] = useState<AgriLog[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAgriLogs(dataStore.getAgriLogs());
    setHealthRecords(dataStore.getHealthRecords());
  }, []);

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 font-sans",
      mode === "health" ? "health-mode bg-sky-50" : mode === "agri" ? "bg-stone-50" : "bg-neutral-900"
    )}>
      {/* Top Bar - Simulated E-Ink Peripheral Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-primary p-1.5 rounded-md">
            {mode === "health" ? <Heart className="w-5 h-5 text-white" /> : <Sprout className="w-5 h-5 text-white" />}
          </div>
          <span className="font-bold text-xl tracking-tight uppercase">Harmonize <span className="text-primary-foreground bg-primary px-1">EcoConnect</span></span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-1 border-stone-300">
            <WifiOff className="w-3 h-3" />
            <span className="text-[10px]">OFFLINE-READY</span>
          </Badge>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <BatteryMedium className="w-5 h-5" />
            <Sun className="w-4 h-4" />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMode("startup")}
            className="hover:bg-primary/10 transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          {mode === "startup" && (
            <StartupView onSelect={handleModeSwitch} />
          )}

          {mode === "agri" && (
            <AgriModeView 
              logs={agriLogs} 
              onAddLog={(log) => setAgriLogs([dataStore.saveAgriLog(log), ...agriLogs])} 
            />
          )}

          {mode === "health" && (
            <HealthModeView 
              records={healthRecords} 
              onAddRecord={(rec) => setHealthRecords([dataStore.saveHealthRecord(rec), ...healthRecords])} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding - Edge Optimized Version */}
      <footer className="py-12 border-t border-border mt-12 bg-background/50">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center space-y-4">
          <div className="flex items-center space-x-2 grayscale opacity-50">
            <Database className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest">v1.0 Edge-Optimized | Oracle69</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
            Engineered for rural resilience. Combining predictive agriculture and primary healthcare into one intelligent, solar-powered, offline-first system.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StartupView({ onSelect }: { onSelect: (m: Mode) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12 py-20"
    >
      <div className="space-y-4 text-center">
        <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 border-neutral-700">POWERED BY SOLAR & AI</Badge>
        <h1 className="text-5xl font-bold text-white tracking-tighter">Choose Your Mode</h1>
        <p className="text-neutral-400 max-w-md mx-auto">Unified platform for rural resilience. Select a dashboard to begin operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => onSelect("agri")}
          className="group relative h-64 overflow-hidden rounded-2xl border-2 border-neutral-800 bg-neutral-900 transition-all hover:border-green-500/50 hover:bg-neutral-800/50 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),transparent)]" />
          <div className="relative p-8 h-full flex flex-col justify-between text-left">
            <div className="bg-green-500/20 p-3 w-fit rounded-xl group-hover:bg-green-500/30 transition-colors">
              <Sprout className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Agri Mode</h2>
              <p className="text-neutral-500 mt-2 text-sm leading-snug">FarmConnect & TessyFarm Nexus. Predictive agriculture, yield logs, and credit tracking.</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => onSelect("health")}
          className="group relative h-64 overflow-hidden rounded-2xl border-2 border-neutral-800 bg-neutral-900 transition-all hover:border-blue-500/50 hover:bg-neutral-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),transparent)]" />
          <div className="relative p-8 h-full flex flex-col justify-between text-left">
            <div className="bg-blue-500/20 p-3 w-fit rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Health Mode</h2>
              <p className="text-neutral-500 mt-2 text-sm leading-snug">AI Health Navigator. Symptom triage, risk stratification, and secure patient data.</p>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

function AgriModeView({ logs, onAddLog }: { logs: AgriLog[], onAddLog: (l: any) => void }) {
  const [logType, setLogType] = useState<any>("crop");
  const [logValue, setLogValue] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    const result = await predictCropYield(
      { 
        recentLogs: logs.slice(0, 5), 
        currentInput: { type: logType, value: logValue, description } 
      },
      image || undefined
    );
    setPrediction(result);
    setLoading(false);
  };

  const clearForm = () => {
    setLogValue("");
    setDescription("");
    setImage(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-stone-200 shadow-sm overflow-hidden border-2">
          <CardHeader className="bg-stone-100/50 border-b border-stone-200 py-3">
            <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Field Log Operations
              </div>
              <Badge variant="outline" className="text-[10px] border-stone-300">EDGE-AUTH</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-stone-500">Asset Category</Label>
                  <select 
                    className="w-full p-2.5 border border-border rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    value={logType}
                    onChange={(e) => setLogType(e.target.value)}
                  >
                    <option value="crop">Crop Condition</option>
                    <option value="disease">Plant/Animal Disease</option>
                    <option value="soil">Soil Moisture/pH</option>
                    <option value="fish">Aquaculture Log</option>
                    <option value="waste">Feed/Waste Index</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-stone-500">Input Value / Status</Label>
                  <Input 
                    placeholder="e.g. 24% humidity or 'Leaf Spot'" 
                    className="h-10 text-sm border-2"
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-stone-500">Detailed Description (Optional)</Label>
                <textarea 
                  className="w-full p-3 border border-border rounded-lg bg-white text-sm min-h-[80px] focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="Describe any symptoms or anomalies observed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <Label className="text-[10px] font-bold uppercase text-stone-500 block mb-2 text-left">Upload Visual Evidence</Label>
                  <div className="relative group">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                {image && (
                  <div className="w-20 h-20 rounded-lg border-2 border-stone-200 overflow-hidden bg-white shrink-0 relative">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setImage(null)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg hover:bg-red-600 transition-colors"
                    >
                      <WifiOff className="w-3 h-3" /> {/* Using WifiOff as a close icon simulation */}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1 font-bold tracking-tight" 
                  onClick={() => {
                    if (logValue) {
                      onAddLog({ type: logType, value: logValue, description, image });
                      clearForm();
                    }
                  }}
                >
                  Save Local
                </Button>
                <Button variant="outline" className="border-2 font-bold px-6" onClick={handlePredict} disabled={loading}>
                  {loading ? "..." : "AI Sync"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 border-2 bg-stone-50 overflow-hidden flex flex-col">
          <CardHeader className="bg-stone-200/50 border-b border-stone-200 py-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Real-time Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-mono font-bold text-stone-500 uppercase">Input Oscillations</p>
                <MiniVisuals data={[20, 35, 25, 45, 30, 55, 40]} title="Activity" color="rgb(34, 197, 94)" />
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-300">
                <div className="flex justify-between text-[8px] font-mono font-bold text-stone-400 uppercase">
                  <span>Storage Engine</span>
                  <span className="text-green-600">Syncing</span>
                </div>
                <p className="text-sm font-bold text-stone-800 tracking-tighter">SQLITE_VCORE_0.1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {prediction && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-green-600 bg-green-50/50 border-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-green-600 hover:bg-green-600 mb-4">EDGE AI INSIGHT</Badge>
                  <h3 className="text-2xl font-bold text-green-950 tracking-tight">{prediction.prediction}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-mono text-green-800">CONFIDENCE: {(prediction.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <TrendingUp className="w-12 h-12 text-green-200" />
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {prediction.tips.map((tip: string, i: number) => (
                  <div key={i} className="bg-white border-2 border-green-200 p-3 rounded-xl flex items-start gap-3">
                    <div className="bg-green-100 p-1 rounded-full"><ChevronRight className="w-3 h-3 text-green-700" /></div>
                    <span className="text-sm font-medium text-green-900">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold uppercase tracking-widest text-stone-400">Recent Environmental Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white border-2 border-stone-200 p-4 rounded-xl flex items-center justify-between group hover:border-primary transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-stone-100 rounded-lg group-hover:bg-primary/10 w-12 h-12 flex items-center justify-center overflow-hidden">
                  {log.image ? (
                    <img src={log.image} alt="Log" className="w-full h-full object-cover rounded" />
                  ) : (
                    log.type === "crop" ? <Sprout className="w-5 h-5" /> : 
                    log.type === "disease" ? <AlertTriangle className="w-5 h-5 text-red-500" /> :
                    log.type === "soil" ? <CloudRain className="w-5 h-5" /> : 
                    log.type === "fish" ? <Activity className="w-5 h-5" /> : <Settings className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold capitalize">{log.type} entry</p>
                  <p className="text-lg font-medium text-stone-600 tracking-tight leading-tight">{log.value}</p>
                  {log.description && <p className="text-[10px] text-stone-400 line-clamp-1 italic">{log.description}</p>}
                </div>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</p>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-stone-200 rounded-2xl">
              <p className="text-stone-400 font-medium">No records found on device.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function HealthModeView({ records, onAddRecord }: { records: HealthRecord[], onAddRecord: (r: any) => void }) {
  const [patientName, setPatientName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [triage, setTriage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriage = async () => {
    if (!symptoms && !image) return;
    setLoading(true);
    const result = await triageSymptoms(symptoms, image || undefined);
    setTriage(result);
    setLoading(false);
  };

  const handleSave = () => {
    if (patientName && (symptoms || image)) {
      onAddRecord({ 
        name: patientName, 
        symptoms, 
        image,
        status: triage?.riskLevel === "High" ? "Critical" : "Assessed" 
      });
      setPatientName("");
      setSymptoms("");
      setImage(null);
      setTriage(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Badge className="bg-sky-600 hover:bg-sky-600">PRIMARY HEALTH NODE</Badge>
          <h2 className="text-4xl font-bold tracking-tighter text-sky-900 uppercase">AI Navigator</h2>
        </div>
        <div className="bg-sky-100/50 p-4 rounded-2xl border-2 border-sky-200 flex-1 max-w-sm">
          <p className="text-[10px] font-bold text-sky-600 uppercase mb-2">Simulated Heart Rate Index</p>
          <MiniVisuals data={[72, 75, 71, 82, 78, 74, 76]} title="BPM" color="rgb(14, 165, 233)" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-2 border-sky-200 shadow-xl shadow-sky-100/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-600" />
              Guided Offline Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Patient Name/Identifier</Label>
              <Input 
                placeholder="Unique patient hash" 
                className="border-sky-200 focus:ring-sky-500"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Symptom Assessment</Label>
              <textarea 
                className="min-h-32 w-full rounded-md border border-sky-200 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe symptoms locally (e.g. fever for 3 days, dry cough)"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <Label className="text-[10px] font-bold uppercase text-sky-600 block mb-2 text-left">Visual Diagnostics</Label>
                <div className="relative group">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="cursor-pointer border-sky-200"
                  />
                </div>
              </div>
              {image && (
                <div className="w-20 h-20 rounded-lg border-2 border-sky-200 overflow-hidden bg-white shrink-0 relative">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg hover:bg-red-600 transition-colors"
                  >
                    <WifiOff className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-sky-600 hover:bg-sky-700" onClick={handleTriage} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze Symptoms & Photo"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <AnimatePresence>
            {triage && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className={cn(
                  "border-2 transition-all duration-300 shadow-xl",
                  triage.riskLevel === "High" ? "border-red-500 bg-red-50" : "border-emerald-500 bg-emerald-50"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={triage.riskLevel === "High" ? "destructive" : "secondary"} className="uppercase font-mono">
                        {triage.riskLevel} RISK UNIT
                      </Badge>
                      {triage.riskLevel === "High" && <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />}
                    </div>
                    <h3 className="text-xl font-bold text-sky-950 mb-2">{triage.advice}</h3>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-sky-600 uppercase tracking-widest underline decoration-sky-300 underline-offset-4 mb-3">Watch for Red Flags:</p>
                      {triage.redFlags.map((flag: string, i: number) => (
                        <div key={i} className="flex gap-2 text-xs font-semibold text-sky-800">
                          <ChevronRight className="w-3 h-3 flex-shrink-0" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-6" variant="outline" onClick={handleSave}>
                      Finalize & Crypt-Save Record
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!triage && (
            <div className="h-full border-2 border-dashed border-sky-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4 bg-sky-50/50">
              <div className="bg-white p-4 rounded-full shadow-sm text-sky-200">
                <Activity className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sky-900">Awaiting Input</p>
                <p className="text-sm text-sky-600">Enter symptoms to generate edge-native triage data.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold uppercase tracking-widest text-sky-300">Patient Vault History</h3>
        <div className="space-y-3">
          {records.map((rec) => (
            <div key={rec.id} className="bg-white border-2 border-sky-100 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-6">
                <div className="bg-sky-50 p-1 rounded-full w-12 h-12 flex items-center justify-center overflow-hidden shrink-0">
                  {rec.image ? (
                    <img src={rec.image} alt="Diagnostic" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-sky-600" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sky-900">{rec.name}</p>
                  <p className="text-sm text-sky-600 line-clamp-1 max-w-xs">{rec.symptoms}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={rec.status === "Critical" ? "destructive" : "outline"} className="font-mono text-[10px]">
                  {rec.status}
                </Badge>
                <p className="text-[10px] font-mono whitespace-nowrap text-sky-400">{new Date(rec.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

