/* AUTO-GENERATED FILE.  DO NOT MODIFY.
 *
 * This class was automatically generated by the
 * java mavlink generator tool. It should not be modified by hand.
 */

package com.MAVLink.enums;

/** 
* Flags to indicate the status of camera storage.
*/
public class STORAGE_STATUS {
   public static final int STORAGE_STATUS_EMPTY = 0; /* Storage is missing (no microSD card loaded for example.) | */
   public static final int STORAGE_STATUS_UNFORMATTED = 1; /* Storage present but unformatted. | */
   public static final int STORAGE_STATUS_READY = 2; /* Storage present and ready. | */
   public static final int STORAGE_STATUS_NOT_SUPPORTED = 3; /* Camera does not supply storage status information. Capacity information in STORAGE_INFORMATION fields will be ignored. | */
   public static final int STORAGE_STATUS_ENUM_END = 4; /*  | */
}
            