import { 
  IonButtons,
  IonButton,
  IonContent, 
  IonHeader, 
  IonMenuButton, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';

const Home: React.FC = () => {
  return (
    <IonPage>
      {/* Header */}
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>My GitHub Stats</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid className="ion-justify-content-center ion-align-items-center">
              <IonRow className="ion-justify-content-center ion-align-items-center">
                <IonCol size="auto" >
                  <IonImg 
                    src="https://github-readme-stats.vercel.app/api?username=ast4rt3&show_icons=true&theme=tokyonight"
                    alt="GitHub Stats"
                    style={{ width: '100%', maxWidth: '400px' }}
                  />
                </IonCol>
                <IonCol size="auto">
                <IonImg 
                     src="https://github-readme-activity-graph.vercel.app/graph?username=ast4rt3&bg_color=ffcfe9&color=9e4c98&line=9e4c98&point=403d3d&area=true&hide_border=true"
                       alt="GitHub Activity Graph"
                        style={{ width: '100%', maxWidth: '460px', border: '2px solid white', borderRadius: '10px' }}
                    />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>


        <IonGrid className="ion-no-padding">
          <IonRow>
            <IonCol>
              <IonButton expand="full" color="primary" routerLink="/it35-lab/app/home/details">
                Go to Details
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
