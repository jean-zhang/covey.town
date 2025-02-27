import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React, { PropsWithChildren } from 'react';
import { TwilioError } from 'twilio-video';
import enhanceMessage from './enhanceMessage';

interface ErrorDialogProps {
  dismissError: () => void;
  error: TwilioError | null;
}

function ErrorDialog({ dismissError, error }: PropsWithChildren<ErrorDialogProps>) {
  const { message, code } = error || {};
  const enhancedMessage = enhanceMessage(message, code);

  return (
    <Dialog open={error !== null} onClose={() => dismissError()} fullWidth maxWidth='xs'>
      <DialogTitle>ERROR</DialogTitle>
      <DialogContent>
        <DialogContentText>{enhancedMessage}</DialogContentText>
        {Boolean(code) && (
          <pre>
            <code>
              Error Code:
              {code}
            </code>
          </pre>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dismissError()} color='primary' autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ErrorDialog;
