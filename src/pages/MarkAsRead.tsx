import {useEffect, useRef, useState} from "react";
import {
    CHANNEL_GROUPS,
    CHANNEL_LAST_MESSAGE,
    CHANNEL_LAST_MESSAGES,
    CHANNEL_MARK_AS_READ
} from "../../shared/constants";
import {CustomDialog} from "../../shared/types";
import '../styles/MarkAsReadPage.css';
import {CheckCircleIcon, Icon} from "@chakra-ui/icons";
import {Button, Input, List, ListItem, Spinner} from "@chakra-ui/react";
import bigInt from "big-integer";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@material-ui/core';
import React from "react";

const hoverProps = {
    cursor: "pointer",
    transition: "all .2s ease-in-out",
    transform: "scale(1.15)",
};

enum Status {
    Sent = "SENT",
    Waiting = "WAITING",
    Error = "ERROR",
    Skipped = "SKIPPED",
}

// get all group dialogs
// get last message from all group dialogs
// filter by keyword
// mark as read all dialogs that have the keyword in the last message

interface Group {
    id: bigint;
    name: string;
    isRead: boolean;
    message : string;
}

const MarkAsRead = () => {
    const [dialogs, setDialogs] = useState<CustomDialog[]>([]);
    const [groups, setGroups] = useState<CustomDialog[]>([]);

    //let [selectedGroupNames, setSelectedGroupNames] = useState<String[]>([])
    let selectedGroupNames: String[] = [];
    const [loading, setLoading] = useState<boolean>(false);

    const [msgSent, setMsgSent] = useState<Record<string, Status>>({});

    const [inputMessage, setInputMessage] = useState<string>('');
    const [groupNames, setGroupNames] = useState<Group[]>([]);

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState(null);

    let _groupNames: Group[] = [];

    useEffect(() => {
        console.log(msgSent);
    }, [msgSent]);


    function isMessageIncluded(mainMessage: string, includedMessage: string): boolean {
        // Convert both messages to lowercase for a case-insensitive check
        const lowerMainMessage = mainMessage.toLowerCase();
        const lowerIncludedMessage = includedMessage.toLowerCase();

        // Check if the included message is present in the main message
        return lowerMainMessage.includes(lowerIncludedMessage);
    }

    const getLastMessage = async (ids: bigInt.BigInteger[], groupName: string): Promise<Array<{ groupId: bigInt.BigInteger; message: string }>> => {
        for (const id of ids) {
            console.log('get last message for group ' + id.valueOf());
        }
        try {
            console.log('get last message for group ' + groupName);
            window.Main.sendAsyncRequest({ method: 'getLastMessage', params: [ids] });

            const data = await new Promise<Array<{ groupId: bigInt.BigInteger; message: string }>>((resolve, reject) => {
                const handleLastMessage = (lastMessageData: Array<{ groupId: bigInt.BigInteger; message: string }>) => {
                    window.Main.off(CHANNEL_LAST_MESSAGE, handleLastMessage);
                    resolve(lastMessageData);
                };
                window.Main.once(CHANNEL_LAST_MESSAGE, handleLastMessage);
            });

            if (!data || !Array.isArray(data) || data.length !== ids.length) {
                console.log('Impossible to get last message for groups');
                return [];
            }

            return data;
        } catch (error) {
            console.error('Error retrieving last message:', error);
            throw error;
        }
    };



    const handleSubmit = async () => {
        try {
            setLoading(true);
            console.log('start import for input message: ' + inputMessage);

            window.Main.sendAsyncRequest({ method: 'startTexting' });

            const _groups: CustomDialog[] = await new Promise((resolve) => {
                const handleGroups = (data: any) => {
                    window.Main.off(CHANNEL_GROUPS, handleGroups);
                    resolve(data as CustomDialog[]);
                };

                window.Main.once(CHANNEL_GROUPS, handleGroups);
            });

            setGroups(_groups);

            const ids = _groups.map(group => group.id.value);

            const lastMessages = await getLastMessage(ids, 'all groups');

            _groupNames = [];

            for (const lastMessage of lastMessages) {
                console.log('last message for group ' + Number(lastMessage.groupId) + ' is ' + lastMessage.message)
                if (isMessageIncluded(lastMessage.message, inputMessage)) {
                    _groupNames.push({ id: lastMessage.groupId as unknown as bigint, name: _groups.find(group => group.id.value == lastMessage.groupId)?.title as string, isRead: false, message:lastMessage.message });
                }
            }

            setGroupNames(_groupNames);
        } catch (error) {
            console.error('Error occurred:', error);
        } finally {
            setLoading(false);
        }
    };




    const handleMarkAsRead = async (id: bigint) : Promise<boolean> => {
            //let _id = bigInt(id.valueOf());
            window.Main.sendAsyncRequest({method: 'markAsRead', params: [id]});
            console.log('mark as read for group ' + groupNames.find(group => group.id === id).name);
            console.log('mark as read for group ' + id);
            let _markAsRead : boolean = await new Promise((resolve) => {
                const handleMarkAsRead = (data: any) => {
                    window.Main.off(CHANNEL_MARK_AS_READ, handleMarkAsRead);
                    resolve(data as boolean);
                };
                window.Main.once(CHANNEL_MARK_AS_READ, handleMarkAsRead);
            });

            const updatedGroups = groupNames.map(group => {
                if (group.id === id && _markAsRead) {
                    return {...group, isRead: true};
                }
                return group;
            });

            setGroupNames(updatedGroups);
            return _markAsRead;
    };

    const handleMarkAllAsRead = async () => {
        try {
            const updatedGroups = await Promise.all(
                groupNames.map(async (group) => {
                    const success = await handleMarkAsRead(group.id);
                    return { ...group, isRead: success };
                })
            );

            setGroupNames(updatedGroups);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleSeeMessage = (message, groupId) => {
        setDialogMessage(message); // Set the message for the dialog
        setSelectedGroupId(groupId); // Set the selected group ID
        setOpenDialog(true); // Open the dialog
    };

    const handleCloseDialog = () => {
        setOpenDialog(false); // Close the dialog
    };


    return (
        <div className="container">
            <h1>Mark groups as read</h1>
            <div className="input-section" style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                <Input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                {loading ? (
                    <Spinner />
                    ) : (
                    <Button onClick={handleSubmit}>Submit</Button>
            )}
            </div>

            <div className="group-list-container">
                <List className="group-list" spacing={3}>
                    {groupNames.map((group) => (
                        <ListItem
                            key={Number(group.id)}
                            className={group.isRead ? 'read' : ''}
                            display="flex"
                            alignItems="center"
                        >
                            {group.name}
                            {group.isRead && (
                                <Icon as={CheckCircleIcon} color="green.500" boxSize={5} marginLeft="2" />
                            )}
                            {!group.isRead && (
                                <Button
                                    variant="ghost"
                                    onClick={() => handleMarkAsRead(group.id)}
                                    marginLeft="2"
                                >
                                    Mark as Read
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleSeeMessage(group.message, group.id)}
                                style={{ marginLeft: 'auto' }}
                            >
                                See Message
                            </Button>
                        </ListItem>
                    ))}
                </List>
            </div>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Message</DialogTitle>
                <DialogContent>
                    {dialogMessage && (
                        <div>
                            <p>
                                {inputMessage ? (
                                    // Bold inputMessage if it exists in dialogMessage (case-insensitive)
                                    <span>
                            {dialogMessage.toLowerCase().includes(inputMessage.toLowerCase()) ? (
                                <>
                                    {dialogMessage.split(new RegExp(`(${inputMessage})`, 'i')).map((part, index) => (
                                        <React.Fragment key={index}>
                                            {index % 2 === 0 ? (
                                                part
                                            ) : (
                                                <strong>{part}</strong>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </>
                            ) : (
                                dialogMessage
                            )}
                        </span>
                                ) : (
                                    dialogMessage
                                )}
                            </p>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>



            <div className="input-section" style={{ display: 'flex', alignItems: 'center', marginTop: '20px'}}>
            {groupNames.length > 0 && (
                <Button onClick={handleMarkAllAsRead}>
                    Mark All Read
                </Button>
            )}
                </div>
        </div>
    );
};
export default MarkAsRead;
