import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import BirthdayGallery from '../pages/BirthdayGallery';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<DashboardLayout />}>
                <Route index element={<BirthdayGallery />} />
                <Route path="home" element={<BirthdayGallery />} />
                <Route path="cadastros" element={<div>Página de Cadastros</div>} />
                <Route path="entregas" element={<div>Página de Entregas</div>} />
                <Route path="avaliacao" element={<div>Página de Avaliação</div>} />
                <Route path="pagamentos" element={<div>Página de Pagamentos</div>} />
                <Route path="docs" element={<div>Página de Documentos</div>} />
                <Route path="anexos" element={<div>Página de Anexos</div>} />
            </Route>
        </Routes>
    );
}
