import { ResultDetailSection } from "@/src/locals-search/components/ResultDetailSection";
import { ResultSection } from "@/src/locals-search/components/ResultSection";
import { SearchBar } from "@/src/locals-search/components/SearchBar";
import { Local } from "@/src/locals-search/interfaces/Local";

const mockLocalResults: Local[] = [
  {
    id: '1',
    name: 'Café Espresso Premium',
    description: 'Café espresso de grano único, tostado artesanal con notas de chocolate y caramelo.',
    price: 8500,
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
    seller: {
      id: 's1',
      name: 'Café Artesano Local',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      email: 'cafe@local.com',
      phone: '+573001234567',
      whatsapp: '573001234567',
    },
    rating: 4.8,
    reviews: 124,
    location: 'Centro, Tu Ciudad',
    variants: [
      { id: 'v1', name: 'Grano entero (500g)', price: 8500 },
      { id: 'v2', name: 'Molido (500g)', price: 8500 },
      { id: 'v3', name: 'Cápsulas (10u)', price: 9500 },
    ],
    fullDescription: 'Café espresso de grano único, tostado artesanal con notas de chocolate y caramelo. Proveniente directamente de fincas locales certificadas. Ideal para preparar espresso, cappuccino o americano. Garantizamos frescura y calidad en cada taza.',
  },
  {
    id: '2',
    name: 'Reparación de Computadoras',
    description: 'Servicio técnico especializado en reparación y mantenimiento de computadores y laptops.',
    price: 50000,
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
    seller: {
      id: 's2',
      name: 'Tech Repairs Plus',
      avatar: 'https://images.pexels.com/photos/3775517/pexels-photo-3775517.jpeg?auto=compress&cs=tinysrgb&w=100',
      email: 'tech@repairs.com',
      phone: '+573002345678',
      whatsapp: '573002345678',
    },
    rating: 4.9,
    reviews: 89,
    location: 'Zona comercial, Tu Ciudad',
    variants: [
      { id: 'v4', name: 'Diagnóstico básico', price: 25000 },
      { id: 'v5', name: 'Reparación estándar', price: 50000 },
      { id: 'v6', name: 'Limpieza profunda', price: 35000 },
    ],
    fullDescription: 'Servicio técnico especializado en reparación y mantenimiento de computadores y laptops. Contamos con technicians certificados y garantía en todos nuestros servicios. Disponemos de repuestos originales y servicio a domicilio.',
  },
  {
    id: '3',
    name: 'Ropa Casual Sostenible',
    description: 'Camisetas y pantalones hechos con algodón orgánico certificado, producción local.',
    price: 65000,
    image: 'https://images.pexels.com/photos/3622622/pexels-photo-3622622.jpeg?auto=compress&cs=tinysrgb&w=400',
    seller: {
      id: 's3',
      name: 'Eco Threads',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=100',
      email: 'info@ecothreads.com',
      phone: '+573003456789',
      whatsapp: '573003456789',
    },
    rating: 4.7,
    reviews: 156,
    location: 'Mall Centro, Tu Ciudad',
    variants: [
      { id: 'v7', name: 'Talla S', price: 65000 },
      { id: 'v8', name: 'Talla M', price: 65000 },
      { id: 'v9', name: 'Talla L', price: 65000 },
      { id: 'v10', name: 'Talla XL', price: 70000 },
    ],
    fullDescription: 'Camisetas y pantalones hechos con algodón orgánico certificado, producción local y comercio justo. Colores naturales, resistentes y cómodos. Perfecto para uso casual diario. Apoyas pequeños productores locales.',
  },
  {
    id: '4',
    name: 'Consultoría Contable',
    description: 'Asesoramiento fiscal y contable para pequeñas y medianas empresas.',
    price: 200000,
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400',
    seller: {
      id: 's4',
      name: 'Contadores Asociados',
      avatar: 'https://images.pexels.com/photos/1181437/pexels-photo-1181437.jpeg?auto=compress&cs=tinysrgb&w=100',
      email: 'contadores@local.com',
      phone: '+573004567890',
      whatsapp: '573004567890',
    },
    rating: 5.0,
    reviews: 42,
    location: 'Centro de negocios, Tu Ciudad',
    variants: [
      { id: 'v11', name: 'Consulta inicial (1 hora)', price: 100000 },
      { id: 'v12', name: 'Asesoramiento completo', price: 200000 },
      { id: 'v13', name: 'Plan anual', price: 2000000 },
    ],
    fullDescription: 'Asesoramiento fiscal y contable integral para pequeñas y medianas empresas. Nuestro equipo de contadores certificados te ayudará con declaraciones, auditorías y planificación tributaria. Experiencia de más de 10 años en la industria.',
  },
];

function LocalsSearchPage() {
  return (
    <div className="w-full space-y-6">
      <SearchBar />
      <div className="flex flex-col gap-4 lg:flex-row">
        <ResultSection localResults={mockLocalResults} />
        <ResultDetailSection />
      </div>
    </div>
  )
}
export default LocalsSearchPage