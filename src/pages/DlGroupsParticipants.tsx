import {useRef, useState} from "react";
import {
    CHANNEL_GROUPS,
    CHANNEL_PARTICIPANTS,
} from "../../shared/constants";
import {CustomDialog, CustomParticipant} from "../../shared/types";
import {Flex, Spinner} from "@chakra-ui/react";
import {NotificationManager} from 'react-notifications';
import Papa from "papaparse";
import styled from 'styled-components';


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const ContentWrapper = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  margin-top: 25px;
`;

const Heading = styled.h1`
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const FileInput = styled.input`
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #3498db;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 5px; /* Adding border-radius for rounded corners */

  &:hover {
    background-color: #2980b9;
  }
`;

const ScrollableList = styled.div`
  overflow-y: auto;
  max-height: 200px;
  padding: 0 10px;
  margin-top: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      margin-bottom: 5px;
    }
  }
`;
const DownloadGroupsParticipants = () => {

    let [importedGroups, setImportedGroups] = useState<CustomDialog[]>([])
    let selectedGroupNames: String[] = []
    const [loading, setLoading] = useState<boolean>(false)
    const [exporting, setExporting] = useState<boolean>(false)
    const fileInput = useRef(null)
    let [participants, setParticipants] = useState<CustomParticipant[]>([])
    let fetchedParticipants: CustomParticipant[] = []

    const reset = () => {
        fetchedParticipants = []
        setParticipants([])
        setImportedGroups([])
        selectedGroupNames = []
        setLoading(false)
        setExporting(false)
    }

    const handleFileUpload = (e) => {
        try {
            reset()
            e.preventDefault();
            Papa.parse(e.target.files[0], {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    selectedGroupNames = results.data.map((group) => group.title.toLowerCase())
                    startImport().then(r => console.log('done'))
                },
            });
        } catch (e) {
            console.log(e)
            NotificationManager.error("Veuillez sélectionner un fichier CSV valide");
        }

    };

    const startExport = () => {
        let csvContent = 'prenom,nom,username\n';

        setExporting(true)
        participants.forEach((participant) => {
            csvContent += `"${participant.firstName}",`;
            csvContent += `"${participant.lastName}",`;
            csvContent += `"${participant.username}"`;
            csvContent += "\n";
        });

        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8'});

        const url = URL.createObjectURL(blob);
        window.Main.download({url: url})
        setExporting(false)
    }

    const filterDialogsByName = (data: CustomDialog[]) => {
        return data.filter((dialog) => selectedGroupNames.includes(dialog.title.toLowerCase()))
    }

    const addParticipantIfNotExists = (newParticipant: CustomParticipant) => {
        const exists = fetchedParticipants.some(
            (participant) => participant.username === newParticipant.username
        );

        if (!exists) {
            fetchedParticipants.push(newParticipant)
        } else {
            console.log(`${newParticipant} already exists in participants.`);
        }
    };


    const getParticipants = async (groupId: bigint): Promise<void> => {
        try {
            console.log('get participants for group ' + groupId);
            window.Main.sendAsyncRequest({ method: 'getGroupParticipants', params: [groupId] });

            const data: any = await new Promise((resolve, reject) => {
                window.Main.once(CHANNEL_PARTICIPANTS, (participantsData) => {
                    if (!participantsData) {
                        reject(new Error("Couldn't get participants"));
                    } else {
                        resolve(participantsData);
                    }
                });
            });

            if (data) {
                let _participants = data as CustomParticipant[];
                console.log('participants: ' + _participants.length);
                for (let participant of _participants) {
                    console.log(participant.username);
                    addParticipantIfNotExists(participant);
                }
            }
        } catch (error) {
            console.error(error);
            NotificationManager.error("Couldn't get participants");
        }
    };


    const startImport = async (): Promise<void> => {
        try {
            console.log('start import');
            setLoading(true);
            await new Promise((resolve) => {
                window.Main.sendAsyncRequest({ method: 'startTexting' });
                resolve(null);
            });

            const importedData: CustomDialog[] = await new Promise((resolve) => {
                const handleGroups = (data: any) => {
                    let filtered: CustomDialog[] = filterDialogsByName(data) as CustomDialog[];
                    console.log('filtered: ' + filtered.length);
                    resolve(filtered);
                    window.Main.off(CHANNEL_GROUPS, handleGroups); // Remove listener after resolving
                };

                window.Main.once(CHANNEL_GROUPS, handleGroups);
            });

            setImportedGroups(importedData);

            const participantsRequests = importedData.map(group => getParticipants(group.id.value as unknown as bigint));
            await Promise.all(participantsRequests);
            setParticipants(fetchedParticipants)

            setLoading(false);
        } catch (error: any) {
            console.error(error);
            setLoading(false);
        }
    };






    return (
        <Container>
            <ContentWrapper>
                <Heading>Import a CSV file with all the group names</Heading>
                <FileInput
                    type={"file"}
                    id={"csvFileInput"}
                    accept={".csv"}
                    ref={fileInput}
                    onChange={handleFileUpload}
                />
                {fileInput !== null && fileInput.current !== null && fileInput.current.files.length > 0 && (
                    <Button onClick={startExport}>
                        {(exporting || loading) ? <Spinner/> :
                            <span>Download the list of {participants.length} participants</span>}
                    </Button>
                )}
            </ContentWrapper>

            <Flex width={'50%'} justifyContent={'space-around'}>
                <ScrollableList>
                    <h2>Imported {importedGroups.length} Groups:</h2>
                    <ul>
                        {importedGroups.map((group, index) => (
                            <li key={index}>{group.title}</li>
                        ))}
                    </ul>
                </ScrollableList>

                <ScrollableList>
                    <h2>Fetched {participants.length} Participants:</h2>
                    <ul>
                        {participants.map((participant, index) => (
                            <li key={index}>{participant.username}</li>
                        ))}
                    </ul>
                </ScrollableList>
            </Flex>
        </Container>




    )
}
export default DownloadGroupsParticipants;