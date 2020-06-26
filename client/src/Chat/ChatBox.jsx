import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Paper from '@material-ui/core/Paper';
import socketIOClient from 'socket.io-client';
import { useSnackbar } from 'notistack';
import moment from "moment";

import {
    useGetGlobalMessages,
    useSendGlobalMessage,
    useGetConversationMessages,
    useSendConversationMessage,
} from '../Services/chatService';

import { initials } from "./Conversations";
import { authenticationService } from '../Services/authenticationService';
import titleCase from '../Utilities/titleCase';

const useStyles = makeStyles(theme => ({
    root: {
        height: '100%',
    },
    headerRow: {
        maxHeight: 60,
        zIndex: 5,
    },
    paper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.palette.primary.dark,
    },
    messageContainer: {
        height: '100%',
    },
    messagesRow: {
        maxHeight: '70vh',
        overflowY: 'auto',
    },
    newMessageRow: {
        width: '100%',
        padding: theme.spacing(0, 2),
    },
    inputRow: {
        display: 'flex',
        alignItems: 'flex-end',
    },
    messageFormPaper: {
        width: "100%",
        padding: theme.spacing(1, 0, 1.7),
    },
    form: {
        width: '100%',
    },
    avatar: {
        margin: theme.spacing(1, 1.5),
    },
    listItem: {
        width: '80%',
    },
    listItemCurrentUser: {
        width: "80%",
        marginLeft: "auto",
        flexDirection: "row-reverse",
    },
    messagePaper: {
        padding: theme.spacing(0, 2),
    },
    listItemTextRight: {
        textAlign: "right",
    },
    listItemTextLeft: {
        display: "block",
        textAlign: "left",
    },
    timeText: {
        display: "block",
        fontSize: "0.688em",
    },
}));

const ChatBox = props => {
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [lastMessage, setLastMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { enqueueSnackbar } = useSnackbar()

    const getGlobalMessages = useGetGlobalMessages();
    const sendGlobalMessage = useSendGlobalMessage();
    const getConversationMessages = useGetConversationMessages();
    const sendConversationMessage = useSendConversationMessage();

    let chatBottom = useRef(null);
    const classes = useStyles();

    useEffect(() => {
        reloadMessages();
        scrollToBottom();
    }, [lastMessage, props.scope, props.conversationId]);

    useEffect(() => {
        const socket = socketIOClient(process.env.REACT_APP_API_URL);
        socket.on('messages', data => setLastMessage(data));
    }, []);

    const reloadMessages = () => {
        if (props.scope === 'Global Chat') {
            getGlobalMessages().then(res => {
                setMessages(res);
            });
        } else if (props.scope !== null && props.conversationId !== null) {
            getConversationMessages(props.user._id).then(res =>
                setMessages(res)
            );
        } else {
            setMessages([]);
        }
    };

    const scrollToBottom = () => {
        chatBottom.current.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = e => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!newMessage.trim().length) {
            return enqueueSnackbar("Cannot send empty message.", {
                variant: "error"
            });
        }
        if (props.scope === 'Global Chat') {
            sendGlobalMessage(newMessage).then(() => {
                setNewMessage('');
                setIsSubmitting(false);
            });
        } else {
            sendConversationMessage(props.user._id, newMessage).then(res => {
                setNewMessage('');
                setIsSubmitting(false);
            });
        }
    };

    return (
        <Grid container className={classes.root}>
            <Grid item xs={12} className={classes.headerRow}>
                <Paper className={classes.paper} square elevation={2}>
                    <Typography color="inherit" variant="h6">
                        {titleCase(props.scope)}
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12}>
                <Grid container className={classes.messageContainer}>
                    <Grid item xs={12} className={classes.messagesRow}>
                        {messages && (
                            <List>
                                {messages.map(m => (
                                    <Message key={m._id} message={m} />
                                ))}
                            </List>
                        )}
                        <div ref={chatBottom} />
                    </Grid>
                    <Grid item xs={12} className={classes.inputRow}>
                        <Paper className={classes.messageFormPaper} square elevation={0}>
                            <form onSubmit={handleSubmit} className={classes.form}>
                                <Grid
                                    container
                                    className={classes.newMessageRow}
                                    alignItems="flex-end"
                                >
                                    <Grid item xs={11}>
                                        <TextField
                                            id="message"
                                            label="Message"
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            value={newMessage}
                                            onChange={e =>
                                                setNewMessage(e.target.value)
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={1}>
                                        <IconButton type="submit"
                                            color="primary" 
                                            disabled={(newMessage.trim().length < 1) || isSubmitting}>
                                            <SendIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default ChatBox;


function Message({ message }) {
    const classes = useStyles();
    const isCurrentUser = 
        message.fromObj[0].username === authenticationService.currentUserValue.username;

    return(
        <ListItem
            className={isCurrentUser ? classes.listItemCurrentUser : classes.listItem}
            alignItems="flex-start"
        >
            <ListItemAvatar
                className={classes.avatar}
            >
                <Avatar>{initials(message.fromObj[0].name)}</Avatar>
            </ListItemAvatar>
            <Paper className={classes.messagePaper} elevation={0}>
                <ListItemText
                    primary={
                        <React.Fragment>
                            {titleCase(message.fromObj[0].name)}
                            <Typography
                                component="small"
                                className={classes.timeText}
                                color="textSecondary"
                                >
                                {moment(message.date).format("LT")}
                            </Typography>
                        </React.Fragment>
                    }
                    className={!!isCurrentUser ? classes.listItemTextRight : ""}
                    secondary={
                        <span className={classes.listItemTextLeft}>
                            {message.body}
                            
                        </span>
                    }
                />
            </Paper>
        </ListItem>
    )
}