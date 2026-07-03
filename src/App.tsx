import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Perfil from "./pages/Perfil";
import Jogar from "./pages/Jogar";
import Historia from "./pages/Historia";
import Bots from "./pages/Bots";
import Batalha from "./pages/Batalha";
import Deck from "./pages/Deck";
import DeckEditar from "./pages/DeckEditar";
import Loja from "./pages/Loja";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/jogar" element={<Jogar />} />
          <Route path="/jogar/historia" element={<Historia />} />
          <Route path="/jogar/bot" element={<Bots />} />
          <Route path="/batalha" element={<Batalha />} />
          <Route path="/deck" element={<Deck />} />
          <Route path="/deck/editar" element={<DeckEditar />} />
          <Route path="/deck/loja" element={<Loja />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
