import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Printer } from "lucide-react";
import { login, checkAuth } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already logged in
  useEffect(() => {
    if (checkAuth()) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (login(password)) {
        toast({ title: "¡Bienvenido!", description: "Acceso concedido" });
        navigate("/admin/dashboard");
      } else {
        toast({ 
          title: "Error", 
          description: "Contraseña incorrecta", 
          variant: "destructive" 
        });
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center galaxy-bg">
      <div className="w-full max-w-md p-8">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-morfika-purple/20 mb-4">
              <Printer className="w-8 h-8 text-morfika-glow" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">MORFIKA</h1>
            <p className="text-muted-foreground mt-2">Panel de Administración</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-muted border-border"
                  placeholder="Ingresa la contraseña"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-glow border-0"
            >
              {loading ? "Verificando..." : "Ingresar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
