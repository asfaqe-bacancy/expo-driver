import { useState, useEffect } from 'react';
import { checkPermissions, requestPermissions } from '@/utils/permissionHandler';

export const usePermissions = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      try {
        // First check existing permissions
        const currentPermissions = await checkPermissions();
        
        if (currentPermissions.location && 
            currentPermissions.background && 
            currentPermissions.notification) {
          setHasPermissions(true);
          setIsChecking(false);
          return;
        }

        // Request permissions if needed
        const granted = await requestPermissions();
        setHasPermissions(granted);
      } catch (error) {
        console.error('Permission check failed:', error);
        setHasPermissions(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAndRequestPermissions();
  }, []);

  return { isChecking, hasPermissions };
};