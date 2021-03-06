﻿using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;

namespace DiskSpace.UNC.Windows
{

    public class WindowsDiskSpace
    {
        [return: MarshalAs(UnmanagedType.Bool)]
        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        private static extern bool GetDiskFreeSpaceEx(string lpDirectoryName, out ulong lpFreeBytesAvailable, out ulong lpTotalNumberOfBytes, out ulong lpTotalNumberOfFreeBytes);

        public struct FileSystemProperties
        {
            private FileSystemProperties(long? totalBytes, long? freeBytes, long? availableBytes)
                : this()
            {
                TotalBytes = totalBytes;
                FreeBytes = freeBytes;
                AvailableBytes = availableBytes;
            }
            /// <summary>
            /// Gets the total number of bytes on the drive.
            /// </summary>
            public long? TotalBytes { get; private set; }
            /// <summary>
            /// Gets the number of bytes free on the drive.
            /// </summary>
            public long? FreeBytes { get; private set; }
            /// <summary>
            /// Gets the number of bytes available on the drive (counts disk quotas).
            /// </summary>
            public long? AvailableBytes { get; private set; }

            /// <summary>
            /// Gets the properties for this file system.
            /// </summary>
            /// <param name="volumeIdentifier">The path whose volume properties are to be queried.</param>
            /// <param name="cancel">An optional <see cref="CancellationToken"/> that can be used to cancel the operation.</param>
            /// <returns>A <see cref="FileSystemProperties"/> containing the properties for the specified file system.</returns>
            public static FileSystemProperties GetProperties(string volumeIdentifier)
            {
                ulong available;
                ulong total;
                ulong free;
                if (GetDiskFreeSpaceEx(volumeIdentifier, out available, out total, out free))
                {
                    return new FileSystemProperties((long)total, (long)free, (long)available);
                }
                return new FileSystemProperties(null, null, null);
            }
            /// <summary>
            /// Asynchronously gets the properties for this file system.
            /// </summary>
            /// <param name="volumeIdentifier">The path whose volume properties are to be queried.</param>
            /// <param name="cancel">An optional <see cref="CancellationToken"/> that can be used to cancel the operation.</param>
            /// <returns>A <see cref="Task"/> containing the <see cref="FileSystemProperties"/> for this entry.</returns>
            public static async Task<FileSystemProperties> GetPropertiesAsync(string volumeIdentifier, CancellationToken cancel = default(CancellationToken))
            {
                return await Task.Run(() =>
                {
                    ulong available;
                    ulong total;
                    ulong free;
                    if (GetDiskFreeSpaceEx(volumeIdentifier, out available, out total, out free))
                    {
                        return new FileSystemProperties((long)total, (long)free, (long)available);
                    }
                    return new FileSystemProperties(null, null, null);
                }, cancel);
            }
        }
    }
}
