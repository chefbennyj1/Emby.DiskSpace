using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using DiskSpace.Helpers;
using MediaBrowser.Controller.Library;
using MediaBrowser.Controller.Notifications;
using MediaBrowser.Model.IO;
using MediaBrowser.Model.Logging;
using MediaBrowser.Model.Serialization;
using MediaBrowser.Model.Services;

namespace DiskSpace.Api
{
    public class DiskSpaceService : IService
    {
        [Route("/GetTotalStorage", "GET", Summary = "Get Total Storage  Data")]
        public class TotalStorage : IReturn<string>
        { 
            public string Total { get; set; }
            public string Used { get; set; }
        }

        [Route("/GetDriveData", "GET", Summary = "Get Drive Data")]
        public class DriveData : IReturn<string>
        {
            public string DriveName         { get; set; }
            public string VolumeLabel       { get; set; }
            public long TotalSize           { get; set; }
            public long UsedSpace           { get; set; }
            public long FreeSpace           { get; set; }
            public string Format            { get; set; }
            public string FriendlyName      { get; set; }
            public string FriendlyUsed      { get; set; }
            public string FriendlyTotal     { get; set; }
            public string FriendlyAvailable { get; set; }
            public bool IsMonitored         { get; set; }
            public bool NotificationEnabled { get; set; }            
            public long Threshold           { get; set; }
            public string Alias             { get; set; }
            public string Error             { get; set; }
        }
        
        private IJsonSerializer JsonSerializer           { get; set; }
        private IFileSystem FileSystem                   { get; set; }
        private ILibraryManager LibraryManager           { get; set; }
        private INotificationManager NotificationManager { get; set; }
        private readonly ILogger logger;

        public DiskSpaceService(IJsonSerializer json, IFileSystem fS, ILogManager logManager, ILibraryManager libMan, INotificationManager noteMan)
        {
            JsonSerializer      = json;
            FileSystem          = fS;
            logger              = logManager.GetLogger(GetType().Name);
            LibraryManager      = libMan;
            NotificationManager = noteMan;

        }

        public string Get(TotalStorage request)
        {
            var data = GetDriveData();
            if (data == null)
            {
                return JsonSerializer.SerializeToString(new DriveData()
                {
                    Error = "Access to drives not allowed."
                });
            }
            return JsonSerializer.SerializeToString(new TotalStorage()
            {
                Total = FileSizeConversions.SizeSuffix(data.Where(d => d.IsMonitored).Sum(partition => partition.TotalSize)),
                Used  = FileSizeConversions.SizeSuffix(data.Where(d => d.IsMonitored).Sum(partition => partition.UsedSpace))
            });
        }

        public string Get(DriveData request)
        {
            var data = GetDriveData();
            if (data == null)
            {
                return JsonSerializer.SerializeToString(new DriveData()
                {
                    Error = "Access to drives not allowed."
                });
            }

            return JsonSerializer.SerializeToString(data);
            
        }

        private List<DriveData> GetDriveData()
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
                    catch
                    {
                    }

                    try
                    {
                        if (fileSystemMetadata.Name.Substring(1, 2).Equals(":\\") &&
                            fileSystemMetadata.Name.Split('\\').Length > 2) continue; //Windows
                    }
                    catch
                    {
                    }

                    try
                    {
                        switch (fileSystemMetadata.Name.Split('/')[1]) //Ignore these mount types in Linux that get returned from the Emby API
                        {
                            case "etc":
                            case "dev":
                            case "run":
                            case "snap":
                            case "sys":
                            case "proc": continue;
                        }
                    }
                    catch { }

                    var driveInfo = new DriveInfo(fileSystemMetadata.Name);

                    if (driveInfo.TotalSize <= 0) continue; //this drive is too small to be listed

                    // ReSharper disable ComplexConditionExpression
                    // ReSharper disable TooManyChainedReferences
                    var config = Plugin.Instance.Configuration;

                    Plugin.Instance.UpdateConfiguration(config);

                    var friendlyName = driveInfo.Name.Replace(@":\", "").Replace("/", "");
                    var isMonitored  = !config.IgnoredPartitions?.Exists(d => d == friendlyName) ?? true;
                    var threshold    = config.MonitoredPartitions != null ? config.MonitoredPartitions.Exists(p => p.Name == friendlyName) 
                            ? config.MonitoredPartitions.FirstOrDefault(p => p.Name == friendlyName).Threshold : 0 : 0;
                    var alias = friendlyName;
                    if (config.MonitoredPartitions != null)
                    {
                        if (config.MonitoredPartitions.Exists(p => p.Name == friendlyName))
                        {
                            if ((config.MonitoredPartitions.FirstOrDefault(p => p.Name == friendlyName).Alias != null))
                            {
                                alias = config.MonitoredPartitions
                                    .FirstOrDefault(p => p.Name == friendlyName)?.Alias;
                            }
                        }
                    }

                    drives.Add(new DriveData()
                    {
                        DriveName                                             = driveInfo.Name,
                        VolumeLabel                                           = driveInfo.VolumeLabel,
                        TotalSize                                             = driveInfo.TotalSize,
                        UsedSpace                                             = driveInfo.TotalSize - driveInfo.TotalFreeSpace,
                        FreeSpace                                             = driveInfo.TotalFreeSpace,
                        Format                                                = driveInfo.DriveFormat,
                        FriendlyName                                          = friendlyName,
                        FriendlyTotal                                         = FileSizeConversions.SizeSuffix(driveInfo.TotalSize, 2),
                        FriendlyUsed                                          = FileSizeConversions.SizeSuffix((driveInfo.TotalSize - driveInfo.TotalFreeSpace)),
                        FriendlyAvailable                                     = FileSizeConversions.SizeSuffix(driveInfo.AvailableFreeSpace),
                        IsMonitored                                           = isMonitored,
                        NotificationEnabled                                   = NotificationManager.GetNotificationTypes().FirstOrDefault(s => s.Type  == "DiskSpaceAlmostFull").Enabled,
                        Threshold                                             = threshold,
                        Alias                                                 = alias
                    });
                }

                return drives;
            }
            catch (UnauthorizedAccessException e)
            {
                // Have your code handle insufficient permissions here
                return null;
            }

            

        }
    }
}
