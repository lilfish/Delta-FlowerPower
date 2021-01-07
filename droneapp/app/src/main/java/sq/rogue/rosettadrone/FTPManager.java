package sq.rogue.rosettadrone;

import com.MAVLink.common.msg_file_transfer_protocol;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.nio.ByteBuffer;

import static com.MAVLink.common.msg_file_transfer_protocol.MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL;

public class FTPManager {
    private MainActivity parent;
    private DroneModel mModel;
    private File currentFile;
    private byte[][] currentFileInPacket;

    public FTPManager(MainActivity parent, DroneModel mModel) {
        this.parent = parent;
        this.mModel = mModel;
        this.currentFile = null;
        this.currentFileInPacket = null;
    }

    public void manage_ftp(msg_file_transfer_protocol msg_ftp_item){
        int session_id = new Short(msg_ftp_item.payload[2]).intValue();
        int opCode = new Short(msg_ftp_item.payload[3]).intValue();
        int offset = getOffset(msg_ftp_item.payload);
//                DEBUG
//                parent.logMessageDJI("opCode: " + opCode);
//                parent.logMessageDJI("sessionId: " + sessionId);
//                parent.logMessageDJI("Offset: " + offset);
//                parent.logMessageDJI("code was " + opCode);
        switch (opCode) {
            case 3: // Return list
                fetchFiles(offset);
                break;
            case 4: // Open file for reading
                int file_id = new Short(msg_ftp_item.payload[12]).intValue();
                openFile(file_id, session_id);
                break;
            case 5: // Read file
                readFile(session_id, offset, msg_ftp_item.payload);
                break;
            case 8: // Remove file
                break;
        }
    }
    public int getOffset(short[] payload){
//        parent.logMessageDJI("CAME HERE!");
        byte[] byteArray = new byte[4];

        for(int i = 0; i <= 3; i++){
            int added = 8 + i;
            short x = new Short(payload[added]);
            byteArray[i] = (byte)(x & 0xff);
        };

        int offset = ByteBuffer.wrap(byteArray).getInt();
        return offset;
    }

    public void fetchFiles(int offset){
        parent.logMessageDJI("Getting files");
        parent.getFilesDir();
        if(parent.mediaFileList.size() < offset) {
            mModel.send_command_ftp_nak(MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL, 10, 0);
        } else {
            String dir_items = "";
            String add_dir = "";
            for (int i = offset; i < parent.mediaFileList.size(); i++) {
                add_dir = "F" + parent.mediaFileList.get(i).getFileName() + "\\t" + parent.mediaFileList.get(i).getFileSize() + "\\0";
                if (dir_items.getBytes().length + add_dir.getBytes().length < (251 - 12)) {
                    dir_items += add_dir;
                }
            }
            parent.logMessageDJI("total: " + dir_items.getBytes().length + ": " + dir_items);

            mModel.send_command_ftp_string_ack(MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL, dir_items, null);
        }
    }

    public void openFile(int file_id, int session_id){
        parent.logMessageDJI("Download file by index " + file_id);
        parent.currentProgress = 0;
        if(parent.lastDownloadedIndex != file_id) {
            parent.downloadFileByIndex(file_id);
            // wait for done
            while (parent.currentProgress != -1) ;
        }
        if(!parent.downloadError){
            byte[] header = new byte[12];
            header[2] = (byte)session_id;
            header[4] = 4;
            parent.logMessageDJI(parent.last_downloaded_file);
            try {
                currentFile = new File(parent.last_downloaded_file);
            } catch (Exception e){
                parent.logMessageDJI(e.toString());
            }
            // convert to byte array
            try (InputStream is = new FileInputStream(currentFile)) {
                if (currentFile.length() > Integer.MAX_VALUE) {
                    mModel.send_command_ftp_nak(MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL, 1, 0);
                    parent.logMessageDJI("File to big!");
                }
                int byte_offset = 0;
                int bytesRead;
                byte[] fetchedFile = new byte[(int) currentFile.length()];
                parent.logMessageDJI("Current file in bytes: " + currentFileInPacket.length);
                while (byte_offset < fetchedFile.length
                        && (bytesRead = is.read(fetchedFile, byte_offset, fetchedFile.length - byte_offset)) >= 0) {
                    byte_offset += bytesRead;
                }

                int payload_data_size = (251-12);
                int total_file_size = (int) currentFile.length();
                int total_packets = total_file_size/payload_data_size;
                for(int i = 0; i <= total_packets; i++){
                    int startByte = payload_data_size * i;
                    int bytes_to_add_size = payload_data_size;
                    if(startByte + payload_data_size > currentFileInPacket.length){
                        bytes_to_add_size = (startByte + payload_data_size) - currentFileInPacket.length;
                    }
                    for (int j = 0; j < bytes_to_add_size; j++) {
                        int byte_to_get = startByte + j;
                        currentFileInPacket[i][j] = fetchedFile[byte_to_get];
                    }
                };
                parent.logMessageDJI("Current file in bytes: " + total_file_size + ", total packets: " + total_packets);

            } catch (FileNotFoundException e) {
                mModel.send_command_ftp_nak(MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL, 10, 0);
                parent.logMessageDJI("FileNotFoundException: " + e.toString());
                return;
            } catch (IOException e) {
                mModel.send_command_ftp_nak(MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL, 1, 0);
                parent.logMessageDJI("IOException: " + e.toString());
                return;
            }
            int file_size = (int)currentFile.length();
            parent.logMessageDJI("File size: " + file_size);
            mModel.send_command_ftp_string_ack(MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL, file_size + "", null);
            parent.logMessageDJI("Opened image " + currentFile.getName());
        } else {
            parent.logMessageDJI("There was an error");
            mModel.send_command_ftp_nak(MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL, 1, 0);
        }
    }

    public void readFile(int session_id, int offset, short[] payload){
        byte[] data = new byte[251];

//      Set offset from original payload
        for(int i = 8; i <= 12; i++){
            short x = new Short(payload[i]);
            data[i] = (byte)(x & 0xff);
        };
//      Set session
        data[2] = (byte)session_id;
        if(currentFile == null || currentFile.length() == 0){
            parent.logMessageDJI("File is null, sending error code");
            mModel.send_command_ftp_nak(MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL, 10, 0);
            return;
        }
        if(offset > (currentFileInPacket.length) ){
            parent.logMessageDJI("offset > currentFileInPacket.length");
            mModel.send_command_ftp_nak(MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL, 6, 0);
            return;
        }
        int bytes_to_add_size = currentFileInPacket[offset].length;
        data[4] = (byte)bytes_to_add_size;

        try {
//          We only need to rewrite byte 12 to bytes_to_add_size (which is the total bytes in currentFileInPacket[packet])
//          Then we just read a packet byte by using the offset as packet_id and i from bytes_to_add_size
            for (int i = 0; i < bytes_to_add_size; i++) {
                int added = i + 12;
                data[added] = currentFileInPacket[offset][i];
            }
//            parent.logMessageDJI("Sending " + bytes_to_add_size + " bytes using FTP protocol");
            mModel.send_command_ftp_bytes_ack(MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL, data);
        } catch (Exception e) {
            parent.logMessageDJI(e.toString());
            mModel.send_command_ftp_nak(MAVLINK_MSG_ID_FILE_TRANSFER_PROTOCOL, 6, 0);
        }
    }
}
