using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using DiskSpace.Helpers;
using MediaBrowser.Controller.Data;
using MediaBrowser.Controller.Entities;
using MediaBrowser.Controller.Library;
using MediaBrowser.Controller.Persistence;
using MediaBrowser.Controller.Providers;
using MediaBrowser.Model.IO;
using MediaBrowser.Model.Logging;
using MediaBrowser.Model.Serialization;
using MediaBrowser.Model.Services;

namespace DiskSpace.Api
{
    public class DiskSpaceService : IService
    {
        [Route("/GetDriveData", "GET", Summary = "Get Drive Data")]
        public class DriveData : IReturn<string>
        {
            public string DriveName { get; set; }
            public string VolumeLabel { get; set; }
            public long TotalSize { get; set; }
            public long UsedSpace { get; set; }
            public long FreeSpace { get; set; }
            public string Format { get; set; }
            public string FriendlyName { get; set; }
            public string FriendlyUsed { get; set; }
            public string FriendlyTotal { get; set; }
            public string FriendlyAvailable { get; set; }
            public bool IsMonitored { get; set; }
            public string Error { get; set; }
        }
        
        private IJsonSerializer JsonSerializer { get; set; }
        private IFileSystem FileSystem { get; set; }
        private ILibraryManager LibraryManager { get; set; }
        private readonly ILogger logger;
        public DiskSpaceService(IJsonSerializer json, IFileSystem fS, ILogManager logManager, ILibraryManager libMan)
        {
            JsonSerializer = json;
            FileSystem = fS;
            logger = logManager.GetLogger(GetType().Name);
            LibraryManager = libMan;
        }
        
        public string Get(DriveData request)
        {
            try
            {
                var drives = new List<DriveData>();
                foreach (var fileSystemMetadata in FileSystem.GetDrives())
                {
                    logger.Info(("DISK SPACE -- " + fileSystemMetadata.FullName).AsMemory());
                    try
                    {
                        if (fileSystemMetadata.Name.Substring(0, 4) == "\\\\")
                        {

                        }
                    }
                    catch { }

                    try
                    {
                        if (fileSystemMetadata.Name.Substring(1,2).Equals(":\\") && fileSystemMetadata.Name.Split('\\').Length > 2) continue; //Windows
                    }
                    catch { }

                    try
                    { 
                        switch (fileSystemMetadata.Name.Split('/')[1]) //Ignore these mount types in Linux that get returned from the Emby API
                        {
                            case "etc": case "dev": case "run": case "snap": case "sys": case "proc": continue;
                        }
                    } catch { }

                    var driveInfo = new DriveInfo(fileSystemMetadata.Name);

                    if (driveInfo.TotalSize <= 0) continue; //this drive is too small to be listed
                    var config = Plugin.Instance.Configuration;
                    var friendlyName = driveInfo.Name.Replace(@":\", "").Replace("/", "");
                    drives.Add(new DriveData()
                    {
                        DriveName         = driveInfo.Name,
                        VolumeLabel       = driveInfo.VolumeLabel,
                        TotalSize         = driveInfo.TotalSize,
                        UsedSpace         = driveInfo.TotalSize - driveInfo.TotalFreeSpace,
                        FreeSpace         = driveInfo.TotalFreeSpace,
                        Format            = driveInfo.DriveFormat,
                        FriendlyName      = friendlyName,
                        FriendlyTotal     = FileSizeConversions.SizeSuffix(driveInfo.TotalSize),
                        FriendlyUsed      = FileSizeConversions.SizeSuffix((driveInfo.TotalSize - driveInfo.TotalFreeSpace)),
                        FriendlyAvailable = FileSizeConversions.SizeSuffix(driveInfo.AvailableFreeSpace),
                        IsMonitored       = config.MonitoredPartitions.FirstOrDefault(d => d.Name == friendlyName)?.Monitored ?? true
                    });
                }
                
                return JsonSerializer.SerializeToString(drives);

            } catch (UnauthorizedAccessException e)
            {
                // Have your code handle insufficient permissions here
                return JsonSerializer.SerializeToString(new DriveData()
                {
                    Error = "Access to drives not allowed."
                });
            }

        }
    }
}
