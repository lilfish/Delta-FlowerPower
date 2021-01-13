/* AUTO-GENERATED FILE.  DO NOT MODIFY.
 *
 * This class was automatically generated by the
 * java mavlink generator tool. It should not be modified by hand.
 */

package com.MAVLink.enums;

/** 
* Camera capability flags (Bitmap)
*/
public class CAMERA_CAP_FLAGS {
   public static final int CAMERA_CAP_FLAGS_CAPTURE_VIDEO = 1; /* Camera is able to record video | */
   public static final int CAMERA_CAP_FLAGS_CAPTURE_IMAGE = 2; /* Camera is able to capture images | */
   public static final int CAMERA_CAP_FLAGS_HAS_MODES = 4; /* Camera has separate Video and Image/Photo modes (MAV_CMD_SET_CAMERA_MODE) | */
   public static final int CAMERA_CAP_FLAGS_CAN_CAPTURE_IMAGE_IN_VIDEO_MODE = 8; /* Camera can capture images while in video mode | */
   public static final int CAMERA_CAP_FLAGS_CAN_CAPTURE_VIDEO_IN_IMAGE_MODE = 16; /* Camera can capture videos while in Photo/Image mode | */
   public static final int CAMERA_CAP_FLAGS_HAS_IMAGE_SURVEY_MODE = 32; /* Camera has image survey mode (MAV_CMD_SET_CAMERA_MODE) | */
   public static final int CAMERA_CAP_FLAGS_HAS_BASIC_ZOOM = 64; /* Camera has basic zoom control (MAV_CMD_SET_CAMERA_ZOOM) | */
   public static final int CAMERA_CAP_FLAGS_HAS_BASIC_FOCUS = 128; /* Camera has basic focus control (MAV_CMD_SET_CAMERA_FOCUS) | */
   public static final int CAMERA_CAP_FLAGS_HAS_VIDEO_STREAM = 256; /* Camera has video streaming capabilities (use MAV_CMD_REQUEST_VIDEO_STREAM_INFORMATION for video streaming info) | */
   public static final int CAMERA_CAP_FLAGS_ENUM_END = 257; /*  | */
}
            