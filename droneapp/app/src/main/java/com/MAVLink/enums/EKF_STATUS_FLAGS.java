/* AUTO-GENERATED FILE.  DO NOT MODIFY.
 *
 * This class was automatically generated by the
 * java mavlink generator tool. It should not be modified by hand.
 */

package com.MAVLink.enums;

/** 
* Flags in EKF_STATUS message.
*/
public class EKF_STATUS_FLAGS {
   public static final int EKF_ATTITUDE = 1; /* Set if EKF's attitude estimate is good. | */
   public static final int EKF_VELOCITY_HORIZ = 2; /* Set if EKF's horizontal velocity estimate is good. | */
   public static final int EKF_VELOCITY_VERT = 4; /* Set if EKF's vertical velocity estimate is good. | */
   public static final int EKF_POS_HORIZ_REL = 8; /* Set if EKF's horizontal position (relative) estimate is good. | */
   public static final int EKF_POS_HORIZ_ABS = 16; /* Set if EKF's horizontal position (absolute) estimate is good. | */
   public static final int EKF_POS_VERT_ABS = 32; /* Set if EKF's vertical position (absolute) estimate is good. | */
   public static final int EKF_POS_VERT_AGL = 64; /* Set if EKF's vertical position (above ground) estimate is good. | */
   public static final int EKF_CONST_POS_MODE = 128; /* EKF is in constant position mode and does not know it's absolute or relative position. | */
   public static final int EKF_PRED_POS_HORIZ_REL = 256; /* Set if EKF's predicted horizontal position (relative) estimate is good. | */
   public static final int EKF_PRED_POS_HORIZ_ABS = 512; /* Set if EKF's predicted horizontal position (absolute) estimate is good. | */
   public static final int EKF_STATUS_FLAGS_ENUM_END = 513; /*  | */
}
            