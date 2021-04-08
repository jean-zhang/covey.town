import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      'background': theme.brand,
      'color': 'white',
      '&:hover': {
        background: '#600101',
      },
    },
  }),
);

export default function EndCallButton(props: { className?: string }) {
  const classes = useStyles();
  const { room } = useVideoContext();

  // const {handleDisconnect} = useAppState();

  return (
    <Button
      onClick={async () => {
        await room.disconnect();
      }}
      className={clsx(classes.button, props.className)}
      data-cy-disconnect>
      Disconnect
    </Button>
  );
}
