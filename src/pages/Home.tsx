import {
  IonButton,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon, 
  IonLabel, 
  IonRouterOutlet, 
  IonTabBar, 
  IonTabButton, 
  IonTabs, 


} from '@ionic/react';

import { IonReactRouter } from '@ionic/react-router';
import { bookOutline, search, star } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';

import Favorites from './home-tabs/Favorites';
import Feed from './home-tabs/Feed';
import Search from './home-tabs/Search';

import { useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {

  const tabs = [
    {name:'Feed', tab:'feed',url: '/it35-lab/app/home/feed', icon: bookOutline},
    {name:'Search', tab:'search', url: '/it35-lab/app/home/search', icon: search},
    {name:'Favorites',tab:'favorites', url: '/it35-lab/app/home/favorites', icon: star},
  ]
  
  const history = useHistory();

  return (
    <IonReactRouter>
    <IonTabs>
      <IonTabBar slot="bottom">

        {tabs.map((item, index) => (
          <IonTabButton key={index} tab={item.tab} href={item.url}>
            <IonIcon icon={item.icon} />
            <IonLabel>{item.name}</IonLabel>
          </IonTabButton>
        ))}
        
      </IonTabBar>
    <IonRouterOutlet>

      <Route exact path="/it35-lab/app/home/feed" render={Feed} />
      <Route exact path="/it35-lab/app/home/search" render={Search} />
      <Route exact path="/it35-lab/app/home/favorites" render={Favorites} />

      <Route exact path="/it35-lab/app/home">
        <Redirect to="/it35-lab/app/home/feed" />
      </Route>

    </IonRouterOutlet>
    </IonTabs>
  </IonReactRouter>
  );
};

export default Home;
