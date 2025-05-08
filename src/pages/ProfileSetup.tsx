import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import {
    IonContent,
    IonPage,
    IonSpinner,
    IonText,
    IonButton,
    IonAlert
} from '@ionic/react';

const ProfileSetup: React.FC = () => {
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const setupProfile = async () => {
            try {
                // Get the pending profile data
                const pendingProfileStr = localStorage.getItem('pendingProfile');
                if (!pendingProfileStr) {
                    history.push('/it35-lab/app/home');
                    return;
                }

                const pendingProfile = JSON.parse(pendingProfileStr);

                // Create the profile
                const { error: insertError } = await supabase
                    .from('users')
                    .insert([pendingProfile])
                    .select()
                    .single();

                if (insertError) {
                    console.error('Profile setup error:', insertError);
                    // Don't show error to user, just log it
                }

                // Clear the pending profile data regardless of success
                localStorage.removeItem('pendingProfile');

                // Always redirect to home
                history.push('/it35-lab/app/home');

            } catch (err: any) {
                console.error('Profile setup error:', err);
                // Don't show error to user, just log it
                history.push('/it35-lab/app/home');
            } finally {
                setLoading(false);
            }
        };

        setupProfile();
    }, [history]);

    // Show loading state briefly
    return (
        <IonPage>
            <IonContent className="ion-padding">
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <IonSpinner name="crescent" />
                    <IonText style={{ marginTop: '20px' }}>Loading...</IonText>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ProfileSetup; 