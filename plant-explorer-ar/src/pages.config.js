import Home from './pages/Home';
import PlantLibrary from './pages/PlantLibrary';
import PlantExplorer from './pages/PlantExplorer';
import Quiz from './pages/Quiz';
import TeacherDashboard from './pages/TeacherDashboard';
import PlantScanner from './pages/PlantScanner';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "PlantLibrary": PlantLibrary,
    "PlantExplorer": PlantExplorer,
    "Quiz": Quiz,
    "TeacherDashboard": TeacherDashboard,
    "PlantScanner": PlantScanner,
    "Landing": Landing,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};