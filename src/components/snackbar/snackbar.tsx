'use client';

import { RiInformationFill, RiAlarmWarningFill, RiCheckboxCircleFill } from '@remixicon/react';

import Portal from '@mui/material/Portal';

import { SnackbarRoot } from './styles';
import { snackbarClasses } from './classes';

// ----------------------------------------------------------------------

export function Snackbar() {
  return (
    <Portal>
      <SnackbarRoot
        expand
        closeButton
        gap={12}
        offset={16}
        visibleToasts={4}
        position="top-right"
        className={snackbarClasses.root}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: snackbarClasses.toast,
            icon: snackbarClasses.icon,
            loader: snackbarClasses.loader,
            loading: snackbarClasses.loading,
            /********/
            content: snackbarClasses.content,
            title: snackbarClasses.title,
            description: snackbarClasses.description,
            /********/
            closeButton: snackbarClasses.closeButton,
            actionButton: snackbarClasses.actionButton,
            cancelButton: snackbarClasses.cancelButton,
            /********/
            info: snackbarClasses.info,
            error: snackbarClasses.error,
            success: snackbarClasses.success,
            warning: snackbarClasses.warning,
          },
        }}
        icons={{
          loading: <span className={snackbarClasses.loadingIcon} />,
          info: <RiInformationFill className={snackbarClasses.iconSvg} />,
          success: <RiCheckboxCircleFill className={snackbarClasses.iconSvg} />,
          warning: <RiAlarmWarningFill className={snackbarClasses.iconSvg} />,
          error: <RiAlarmWarningFill className={snackbarClasses.iconSvg} />,
        }}
      />
    </Portal>
  );
}
