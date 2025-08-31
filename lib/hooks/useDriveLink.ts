import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DriveLinkState {
    showModal: boolean;
    link: string;
    isDirty: boolean;
    error: string;
    isUpdating: boolean;
    updated: boolean;
    isValidating: boolean;
    validationResult: { accessible: boolean; message: string; status: number } | null;
}

export function useDriveLink(refreshAll: () => void) {
    const { user } = useAuth();
    
    const [driveLinkState, setDriveLinkState] = useState<DriveLinkState>({
        showModal: false,
        link: '',
        isDirty: false,
        error: '',
        isUpdating: false,
        updated: false,
        isValidating: false,
        validationResult: null
    });

    const validateDriveLink = async (driveLink: string) => {
        setDriveLinkState(prev => ({ ...prev, isValidating: true, validationResult: null, error: '' }));

        try {
            const response = await fetch('/api/v1/team/checkdrivelink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ driveLink }),
            });

            const result = await response.json();

            if (response.ok) {
                setDriveLinkState(prev => ({
                    ...prev,
                    validationResult: result,
                    error: result.accessible ? '' : result.message
                }));
                return result;
            } else {
                setDriveLinkState(prev => ({
                    ...prev,
                    error: result.error || 'Failed to validate drive link'
                }));
                return null;
            }
        } catch (error) {
            console.error('Drive link validation error:', error);
            const errorMessage = 'Failed to validate drive link. Please check your connection.';
            setDriveLinkState(prev => ({ ...prev, error: errorMessage }));
            return null;
        } finally {
            setDriveLinkState(prev => ({ ...prev, isValidating: false }));
        }
    };

    const handleDriveLinkChange = async (drive_link: string, teamId: string) => {
        if (!user) return;

        setDriveLinkState(prev => ({ ...prev, isUpdating: true, error: '' }));

        try {
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/v1/team/drive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ drive_link, team_id: teamId }),
            });

            if (res.ok) {
                setDriveLinkState(prev => ({
                    ...prev,
                    updated: true,
                    showModal: false,
                    isDirty: false
                }));
                refreshAll();
                setTimeout(() => {
                    setDriveLinkState(prev => ({ ...prev, updated: false }));
                }, 1500);
            } else {
                const errorData = await res.json();
                setDriveLinkState(prev => ({
                    ...prev,
                    error: errorData.error || 'Failed to update drive link'
                }));
            }
        } catch (error) {
            console.error('Error updating drive link:', error);
            setDriveLinkState(prev => ({
                ...prev,
                error: 'An error occurred while updating the drive link'
            }));
        } finally {
            setDriveLinkState(prev => ({ ...prev, isUpdating: false }));
        }
    };

    const openModal = (currentLink?: string) => {
        setDriveLinkState(prev => ({
            ...prev,
            link: currentLink || '',
            isDirty: false,
            error: '',
            showModal: true,
            validationResult: null
        }));
    };

    const closeModal = () => {
        setDriveLinkState(prev => ({
            ...prev,
            showModal: false,
            link: '',
            isDirty: false,
            error: '',
            validationResult: null
        }));
    };

    const updateLink = (link: string) => {
        setDriveLinkState(prev => ({
            ...prev,
            link,
            isDirty: true,
            validationResult: null,
            error: ''
        }));
    };

    return {
        driveLinkState,
        validateDriveLink,
        handleDriveLinkChange,
        openModal,
        closeModal,
        updateLink
    };
}
