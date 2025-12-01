import { FaGraduationCap, FaTools, FaFolder, FaHome, FaUsers, FaBriefcase, FaWallet, FaList, FaSearch, FaHistory } from 'react-icons/fa';
import { BsFillPersonPlusFill, BsGraphUpArrow } from "react-icons/bs";
import { IoDocumentText } from "react-icons/io5";
import { BsClipboard2PulseFill } from "react-icons/bs";

const SidebarData = [
  { title: 'Busca', path: '/home', icon: FaSearch },
  {
    title: 'Cadastros',
    path: '/cadastros',
    icon: BsFillPersonPlusFill,
    subNav: [
      { title: 'Funcionários', path: '/cadastros/funcionarios', icon: FaUsers },
      { title: 'Formação', path: '/cadastros/formacao', icon: FaGraduationCap },
      { title: 'Cargo', path: '/cadastros/cargos', icon: FaBriefcase },
      { title: 'Quesito', path: '/cadastros/quesito', icon: FaList },
      { title: 'EPI', path: '/cadastros/epi', icon: FaTools }
    ]
  },
  { title: 'Entrega EPIs', path: '/entregas', icon: FaTools },
  { title: 'Registro EPIs', path: '/registro-epis', icon: FaHistory },
  { title: 'Avaliação', path: '/avaliacao', icon: BsClipboard2PulseFill },
  { title: 'Pagamentos', path: '/pagamentos', icon: FaWallet },
  { title: 'Documentos', path: '/docs', icon: IoDocumentText },
  { title: 'Anexos', path: '/anexos', icon: FaFolder },
  { title: 'Histórico', path: '/historico', icon: FaHistory },
];

export default SidebarData;
