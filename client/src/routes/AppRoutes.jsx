import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import EmployeeSearch from '../pages/EmployeeSearch';
import Funcionarios from '../pages/Funcionarios';
import Formacoes from '../pages/Formacoes';
import Cargos from '../pages/Cargos';
import Login from '../pages/Login';
import Register from '../pages/Register';
import PrivateRoute from '../components/PrivateRoute';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<PrivateRoute />}>
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<EmployeeSearch />} />
                    <Route path="home" element={<EmployeeSearch />} />
                    <Route path="cadastros" element={<div>Página de Cadastros</div>} />
                    <Route path="cadastros/funcionarios" element={<Funcionarios />} />
                    <Route path="cadastros/formacao" element={<Formacoes />} />
                    <Route path="cadastros/cargos" element={<Cargos />} />
                    <Route path="entregas" element={<div>Página de Entregas</div>} />
                    <Route path="avaliacao" element={<div>Página de Avaliação</div>} />
                    <Route path="pagamentos" element={<div>Página de Pagamentos</div>} />
                    <Route path="docs" element={<div>Página de Documentos</div>} />
                    <Route path="anexos" element={<div>Página de Anexos</div>} />
                </Route>
            </Route>
        </Routes>
    );
}
