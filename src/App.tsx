import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from './contexts/AuthContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */


/* Theme variables */
import './theme/variables.css';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Register from './pages/Register';
import AuthGuard from './components/AuthGuard';
import EditProfilePage from './pages/EditProfilePage';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/it35-lab" component={Login} />
          <Route exact path="/it35-lab/register" component={Register} />
          <Route path="/it35-lab/app" component={Menu} />
          <AuthGuard>
            <>
              <Route path="/it35-lab/app/home" component={Menu} />
              <Route path="/it35-lab/app/home/feed" component={Menu} />
              <Route path="/it35-lab/app/Logs" component={Menu} />
              <Route path="/it35-lab/app/IncidentAndReport" component={Menu} />
              <Route path="/it35-lab/app/AlertAndNotification" component={Menu} />
              <Route path="/it35-lab/app/EventMonitoring" component={Menu} />
              <Route path="/it35-lab/app/profile" component={EditProfilePage} />
            </>
          </AuthGuard>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;