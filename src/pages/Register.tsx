import {
    IonAlert,
    IonAvatar,
    IonButton,
    IonContent,
    IonInput,
    IonLabel,
    IonNote,
    IonPage,
    IonModal,
    IonText,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonInputPasswordToggle,
    IonGrid, // Added for layout
    IonRow,  // Added for layout
    IonCol   // Added for layout
} from '@ionic/react';
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useHistory } from 'react-router-dom';

const Register: React.FC = () => {
    // --- State Variables ---
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState(''); // <-- Added First Name state
    const [lastName, setLastName] = useState('');   // <-- Added Last Name state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Focus state for floating labels
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [isFirstNameFocused, setIsFirstNameFocused] = useState(false); // <-- Added
    const [isLastNameFocused, setIsLastNameFocused] = useState(false);  // <-- Added
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

    const history = useHistory();

    // --- Helper Functions ---
    const displayError = (message: string) => {
        setAlertMessage(message);
        setShowAlert(true);
    };

    // --- Event Handlers ---
    const handleOpenVerificationModal = () => {
        // Basic Client-side Validation
        if (!username.trim()) {
             displayError("Please enter a username.");
             return;
        }
        if (!firstName.trim()) { // <-- Added First Name check
             displayError("Please enter your first name.");
             return;
        }
         if (!lastName.trim()) { // <-- Added Last Name check
             displayError("Please enter your last name.");
             return;
        }
        if (!email.endsWith("@nbsc.edu.ph")) {
            displayError("Only @nbsc.edu.ph emails are allowed to register.");
            return;
        }
        if (password.length < 6) {
            displayError("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            displayError("Passwords do not match.");
            return;
        }

        // All checks passed, show confirmation modal
        setShowVerificationModal(true);
    };

    const doRegister = async () => {
        // Re-check critical conditions before proceeding
        if (!username.trim() || !firstName.trim() || !lastName.trim() || !email.endsWith("@nbsc.edu.ph") || password !== confirmPassword || password.length < 6) {
            setShowVerificationModal(false);
            displayError("Registration requirements not met. Please check all fields.");
            return;
        }

        try {
            console.log('Starting registration process...');
            
            // 1. Sign up with Supabase Auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                        first_name: firstName,
                        last_name: lastName,
                    },
                },
            });

            if (signUpError) {
                console.error('Auth signup error:', signUpError);
                if (signUpError.message.includes("For security purposes")) {
                    throw new Error("Too many registration attempts. Please wait a minute before trying again.");
                }
                throw signUpError;
            }
            
            if (!authData.user || !authData.user.id) {
                console.error('No user data returned from auth signup');
                throw new Error("Registration completed but user ID is missing.");
            }

            console.log('Auth signup successful, creating user record...');

            // 2. Create user record in the database
            const { data: userData, error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        id: authData.user.id,
                        email: email.trim(),
                        username: username.trim(),
                        user_firstname: firstName.trim(),
                        user_lastname: lastName.trim(),
                        user_avatar_url: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (insertError) {
                console.error('Error creating user record:', insertError);
                if (insertError.code === '23505') {
                    if (insertError.message.includes('users_email_key')) {
                        throw new Error('This email is already registered. Please use a different email or try logging in.');
                    } else if (insertError.message.includes('users_username_key')) {
                        throw new Error('This username is already taken. Please choose a different username.');
                    }
                }
                throw new Error(`Failed to create user profile: ${insertError.message}`);
            }

            console.log('User record created successfully:', userData);

            // 3. Success - Show confirmation
            setShowVerificationModal(false);
            setShowSuccessModal(true);

        } catch (err: any) {
            setShowVerificationModal(false);
            console.error("Registration process error:", err);
            
            // Map common Supabase errors to friendlier messages
            if (err.message.includes("User already registered")) {
                displayError("An account with this email already exists.");
            } else if (err.message.includes("duplicate key value violates unique constraint")) {
                displayError("This username is already taken. Please choose another one.");
            } else if (err.message.includes("Failed to create user profile")) {
                displayError(err.message);
            } else if (err.message.includes("Too many registration attempts")) {
                displayError(err.message);
            } else {
                displayError("Registration failed. Please try again or contact support.");
            }
        }
    };

    const handleSuccessModalDismiss = () => {
        setShowSuccessModal(false);
        history.push('/it35-lab'); // Redirect to login
    }

    // --- Render ---
    return (
        <IonPage>
            <IonContent className="ion-padding" fullscreen style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
                <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
                    {/* Left Side (Form) */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '20px', overflowY: 'auto' }}>
                        {/* Header */}
                        <div style={{ width: '90%', maxWidth: '450px', marginBottom: '25px', textAlign: 'left' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px', color: '#1a1b26' }}>Create Your Account</h2>
                            <p style={{ fontSize: '16px', color: '#757575', margin: 0 }}>Please fill in your details to register</p>
                        </div>

                        {/* Username Field */}
                        <div style={{ width: '90%', maxWidth: '450px', marginBottom: '25px' }}>
                            <div style={{ position: 'relative', borderBottom: `2px solid ${isUsernameFocused ? 'var(--ion-color-primary)' : '#e0e0e0'}`, transition: 'border-color 0.3s ease', paddingBottom: '5px' }}>
                                <IonLabel style={{ position: 'absolute', top: isUsernameFocused || username ? '0' : '50%', transform: `translateY(${isUsernameFocused || username ? '-50%' : '-50%'})`, transformOrigin: 'left top', left: '0', color: isUsernameFocused ? 'var(--ion-color-primary)' : '#757575', fontSize: isUsernameFocused || username ? '12px' : '16px', transition: 'all 0.3s ease', pointerEvents: 'none', paddingTop: isUsernameFocused || username ? '0' : '10px' }}>
                                    Username
                                </IonLabel>
                                <IonInput type="text" value={username} onIonChange={e => setUsername(e.detail.value!)} onIonFocus={() => setIsUsernameFocused(true)} onIonBlur={() => setIsUsernameFocused(false)} style={{ '--padding-top': '15px', '--padding-bottom': '5px', '--padding-start': '0px', width: '100%', fontSize: '16px' }} />
                            </div>
                        </div>

                        {/* First and Last Name Fields (in a grid for alignment) */}
                        <IonGrid style={{ width: '90%', maxWidth: '450px', padding: 0, marginBottom: '10px' }}>
                           <IonRow>
                               <IonCol size="12" sizeMd="6" style={{ paddingLeft: 0, paddingRight: '8px', marginBottom: '15px' }}>
                                    {/* First Name Field */}
                                     <div style={{ position: 'relative', borderBottom: `2px solid ${isFirstNameFocused ? 'var(--ion-color-primary)' : '#e0e0e0'}`, transition: 'border-color 0.3s ease', paddingBottom: '5px' }}>
                                        <IonLabel style={{ position: 'absolute', top: isFirstNameFocused || firstName ? '0' : '50%', transform: `translateY(${isFirstNameFocused || firstName ? '-50%' : '-50%'})`, transformOrigin: 'left top', left: '0', color: isFirstNameFocused ? 'var(--ion-color-primary)' : '#757575', fontSize: isFirstNameFocused || firstName ? '12px' : '16px', transition: 'all 0.3s ease', pointerEvents: 'none', paddingTop: isFirstNameFocused || firstName ? '0' : '10px' }}>
                                            First Name
                                        </IonLabel>
                                        <IonInput type="text" value={firstName} onIonChange={e => setFirstName(e.detail.value!)} onIonFocus={() => setIsFirstNameFocused(true)} onIonBlur={() => setIsFirstNameFocused(false)} style={{ '--padding-top': '15px', '--padding-bottom': '5px', '--padding-start': '0px', width: '100%', fontSize: '16px' }} />
                                    </div>
                               </IonCol>
                               <IonCol size="12" sizeMd="6" style={{ paddingLeft: '8px', paddingRight: 0, marginBottom: '15px' }}>
                                    {/* Last Name Field */}
                                     <div style={{ position: 'relative', borderBottom: `2px solid ${isLastNameFocused ? 'var(--ion-color-primary)' : '#e0e0e0'}`, transition: 'border-color 0.3s ease', paddingBottom: '5px' }}>
                                        <IonLabel style={{ position: 'absolute', top: isLastNameFocused || lastName ? '0' : '50%', transform: `translateY(${isLastNameFocused || lastName ? '-50%' : '-50%'})`, transformOrigin: 'left top', left: '0', color: isLastNameFocused ? 'var(--ion-color-primary)' : '#757575', fontSize: isLastNameFocused || lastName ? '12px' : '16px', transition: 'all 0.3s ease', pointerEvents: 'none', paddingTop: isLastNameFocused || lastName ? '0' : '10px' }}>
                                            Last Name
                                        </IonLabel>
                                        <IonInput type="text" value={lastName} onIonChange={e => setLastName(e.detail.value!)} onIonFocus={() => setIsLastNameFocused(true)} onIonBlur={() => setIsLastNameFocused(false)} style={{ '--padding-top': '15px', '--padding-bottom': '5px', '--padding-start': '0px', width: '100%', fontSize: '16px' }} />
                                    </div>
                               </IonCol>
                           </IonRow>
                        </IonGrid>


                        {/* Email Field */}
                        <div style={{ width: '90%', maxWidth: '450px', marginBottom: '25px' }}>
                             <div style={{ position: 'relative', borderBottom: `2px solid ${isEmailFocused ? 'var(--ion-color-primary)' : '#e0e0e0'}`, transition: 'border-color 0.3s ease', paddingBottom: '5px' }}>
                                <IonLabel style={{ position: 'absolute', top: isEmailFocused || email ? '0' : '50%', transform: `translateY(${isEmailFocused || email ? '-50%' : '-50%'})`, transformOrigin: 'left top', left: '0', color: isEmailFocused ? 'var(--ion-color-primary)' : '#757575', fontSize: isEmailFocused || email ? '12px' : '16px', transition: 'all 0.3s ease', pointerEvents: 'none', paddingTop: isEmailFocused || email ? '0' : '10px' }}>
                                    Email (@nbsc.edu.ph)
                                </IonLabel>
                                <IonInput type="email" value={email} onIonChange={e => setEmail(e.detail.value!)} onIonFocus={() => setIsEmailFocused(true)} onIonBlur={() => setIsEmailFocused(false)} style={{ '--padding-top': '15px', '--padding-bottom': '5px', '--padding-start': '0px', width: '100%', fontSize: '16px' }} />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div style={{ width: '90%', maxWidth: '450px', marginBottom: '25px' }}>
                            <div style={{ position: 'relative', borderBottom: `2px solid ${isPasswordFocused ? 'var(--ion-color-primary)' : '#e0e0e0'}`, transition: 'border-color 0.3s ease', paddingBottom: '5px', display: 'flex', alignItems: 'center' }}>
                                <IonLabel style={{ position: 'absolute', top: isPasswordFocused || password ? '0' : '50%', transform: `translateY(${isPasswordFocused || password ? '-50%' : '-50%'})`, transformOrigin: 'left top', left: '0', color: isPasswordFocused ? 'var(--ion-color-primary)' : '#757575', fontSize: isPasswordFocused || password ? '12px' : '16px', transition: 'all 0.3s ease', pointerEvents: 'none', paddingTop: isPasswordFocused || password ? '0' : '10px' }}>
                                    Password (min 6 chars)
                                </IonLabel>
                                <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} onIonFocus={() => setIsPasswordFocused(true)} onIonBlur={() => setIsPasswordFocused(false)} style={{ '--padding-top': '15px', '--padding-bottom': '5px', '--padding-start': '0px', flexGrow: 1, fontSize: '16px' }} />
                                <IonInputPasswordToggle slot="end" style={{ position: 'relative', right: 0, top: 'auto' }} />
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div style={{ width: '90%', maxWidth: '450px', marginBottom: '30px' }}>
                             <div style={{ position: 'relative', borderBottom: `2px solid ${isConfirmPasswordFocused ? 'var(--ion-color-primary)' : '#e0e0e0'}`, transition: 'border-color 0.3s ease', paddingBottom: '5px', display: 'flex', alignItems: 'center' }}>
                                <IonLabel style={{ position: 'absolute', top: isConfirmPasswordFocused || confirmPassword ? '0' : '50%', transform: `translateY(${isConfirmPasswordFocused || confirmPassword ? '-50%' : '-50%'})`, transformOrigin: 'left top', left: '0', color: isConfirmPasswordFocused ? 'var(--ion-color-primary)' : '#757575', fontSize: isConfirmPasswordFocused || confirmPassword ? '12px' : '16px', transition: 'all 0.3s ease', pointerEvents: 'none', paddingTop: isConfirmPasswordFocused || confirmPassword ? '0' : '10px' }}>
                                    Confirm Password
                                </IonLabel>
                                <IonInput type="password" value={confirmPassword} onIonChange={e => setConfirmPassword(e.detail.value!)} onIonFocus={() => setIsConfirmPasswordFocused(true)} onIonBlur={() => setIsConfirmPasswordFocused(false)} style={{ '--padding-top': '15px', '--padding-bottom': '5px', '--padding-start': '0px', flexGrow: 1, fontSize: '16px' }} />
                                <IonInputPasswordToggle slot="end" style={{ position: 'relative', right: 0, top: 'auto' }} />
                            </div>
                        </div>

                        {/* Buttons */}
                        <IonButton onClick={handleOpenVerificationModal} expand="block" style={{ width: '90%', maxWidth: '450px', '--border-radius': '25px', '--padding-top': '15px', '--padding-bottom': '15px', '--box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '10px' }}>
                            Register
                        </IonButton>
                        <IonButton routerLink="/it35-lab" expand="block" fill="clear" style={{ width: '90%', maxWidth: '450px', color: 'var(--ion-color-primary)' }}>
                            Already have an account? Sign in
                        </IonButton>
                    </div>

                    {/* Border Line */}
                    <div style={{ width: '1px', backgroundColor: '#e0e0e0', height: '80%', alignSelf: 'center', display: 'none' }}></div>

                    {/* Right Side (Logo) - Hidden on smaller screens */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1b26', height: '100%'}}>
                        <IonAvatar style={{ width: '200px', height: '200px' }}>
                            <img src="/assets/icon/NBSC_logo.png" alt="NBSC Logo" />
                        </IonAvatar>
                    </div>
                </div>
            </IonContent>

            {/* General Error Alert */}
            <IonAlert isOpen={showAlert} onDidDismiss={() => setShowAlert(false)} header={"Registration Error"} message={alertMessage} buttons={['OK']} />

            {/* Verification Modal (Updated) */}
            <IonModal isOpen={showVerificationModal} onDidDismiss={() => setShowVerificationModal(false)}>
                <IonContent className="ion-padding">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <IonCard style={{ width: '90%', maxWidth: '450px' }}>
                            <IonCardHeader>
                                <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>Confirm Registration</IonCardTitle>
                                <hr style={{ border: 0, borderTop: '1px solid #e0e0e0', margin: '15px 0' }} />
                            </IonCardHeader>
                            <IonCardContent style={{ paddingTop: 0 }}>
                                {/* Display User Info for Confirmation */}
                                <div style={{ marginBottom: '10px' }}>
                                    <IonLabel style={{ fontSize: '0.8rem', color: '#757575', display: 'block', marginBottom: '2px' }}>Username</IonLabel>
                                    <IonText style={{ fontSize: '1.1rem', fontWeight: '500' }}>{username}</IonText>
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <IonLabel style={{ fontSize: '0.8rem', color: '#757575', display: 'block', marginBottom: '2px' }}>First Name</IonLabel>
                                    <IonText style={{ fontSize: '1.1rem', fontWeight: '500' }}>{firstName}</IonText>
                                </div>
                                 <div style={{ marginBottom: '10px' }}>
                                    <IonLabel style={{ fontSize: '0.8rem', color: '#757575', display: 'block', marginBottom: '2px' }}>Last Name</IonLabel>
                                    <IonText style={{ fontSize: '1.1rem', fontWeight: '500' }}>{lastName}</IonText>
                                </div>
                                <div>
                                    <IonLabel style={{ fontSize: '0.8rem', color: '#757575', display: 'block', marginBottom: '2px' }}>Email</IonLabel>
                                    <IonText style={{ fontSize: '1.1rem', fontWeight: '500' }}>{email}</IonText>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px', gap: '10px' }}>
                                    <IonButton fill="clear" onClick={() => setShowVerificationModal(false)} style={{ color: '#757575' }}>
                                        Cancel
                                    </IonButton>
                                    <IonButton color="primary" onClick={doRegister}>
                                        Confirm & Register
                                    </IonButton>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    </div>
                </IonContent>
            </IonModal>

            {/* Success Modal */}
            <IonModal isOpen={showSuccessModal} onDidDismiss={handleSuccessModalDismiss}>
                <IonContent className="ion-padding">
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', padding: '20px' }}>
                        <IonText>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--ion-color-primary)', marginBottom: '15px' }}>Registration Successful 🎉</h2>
                            <p style={{ fontSize: '1rem', color: '#757575', margin: '0 auto 25px auto', maxWidth: '350px' }}>
                                Your account has been created. Please check your email ({email}) to verify your account. After verifying your email, you can log in to complete your profile setup.
                            </p>
                        </IonText>
                        <IonButton onClick={handleSuccessModalDismiss} color="primary" style={{ '--border-radius': '25px', '--padding-top': '15px', '--padding-bottom': '15px', minWidth: '180px' }}>
                            Go to Login
                        </IonButton>
                    </div>
                </IonContent>
            </IonModal>

        </IonPage>
    );
};

export default Register;