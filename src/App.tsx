import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Sidemenu from './components/Sidemenu'; 

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>

      <IonSplitPane contentId="main-content">
        <Sidemenu /> {/* ✅ Include the Sidemenu */}
        <IonRouterOutlet id="main-content">
          <Route exact path="/it35-lab/home">
            <Home />
          </Route>
          <Route exact path="/it35-lab/login">
            <Login />
          </Route>
          <Route exact path="/it35-lab/">
            <Redirect to="/it35-lab/home" />
          </Route>
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  </IonApp>
);

export default App;
