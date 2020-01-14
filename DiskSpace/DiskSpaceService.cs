using System;
using System.Collections.Generic;
using System.IO;
using DiskSpace.Helpers;
using MediaBrowser.Model.IO;
using MediaBrowser.Model.Serialization;
using MediaBrowser.Model.Services;

namespace DiskSpace
{
    public class DiskSpaceService : IService
    {
        [Route("/GetDriveData", "GET", Summary = "Get Drive Data")]
        public class DriveData : IReturn<string>
        {
            public string DriveName { get; set; }
            public long TotalSize { get; set; }
            public long UsedSpace { get; set; }
            public long FreeSpace { get; set; }
            public string Format { get; set; }
            public string FriendlyName { get; set; }
            public string FriendlyUsed { get; set; }
            public string FriendlyTotal { get; set; }
            public string Error { get; set; }
        }
        
        private IJsonSerializer JsonSerializer { get; set; }
        private IFileSystem FileSystem { get; set; }

        public DiskSpaceService(IJsonSerializer json, IFileSystem fS)
        {
            JsonSerializer = json;
            FileSystem = fS;
        }
        
        public string Get(DriveData request)
        {
            try
            {
                var drives = new List<DriveData>();
                foreach (var fileSystemMetadata in FileSystem.GetDrives())
                {
                    try
                    {
                        if (fileSystemMetadata.Name.Split('\\').Length > 2) continue; //Windows
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

                    drives.Add(new DriveData()
                    {
                        DriveName     = driveInfo.Name,
                        TotalSize     = driveInfo.TotalSize,
                        UsedSpace     = driveInfo.TotalSize - driveInfo.TotalFreeSpace,
                        FreeSpace     = driveInfo.TotalFreeSpace,
                        Format        = driveInfo.DriveFormat,
                        FriendlyName  = driveInfo.Name.Replace(@":\", "").Replace("/",""),
                        FriendlyTotal = FileSizeConversions.SizeSuffix(driveInfo.TotalSize),
                        FriendlyUsed  = FileSizeConversions.SizeSuffix((driveInfo.TotalSize - driveInfo.TotalFreeSpace))
                    });
                }
                /*
                // ReSharper disable once ComplexConditionExpression
                var drives = DriveInfo.GetDrives().Select(d => new DriveData()
                {
                    DriveName = d.Name,
                    TotalSize = d.TotalSize,
                    UsedSpace = d.TotalSize - d.TotalFreeSpace,
                    FreeSpace = d.TotalFreeSpace,
                    Format = d.DriveFormat,
                    FriendlyName = d.Name.Replace(@":\", ""),
                    FriendlyTotal = FileSizeConversions.SizeSuffix(d.TotalSize),
                    FriendlyUsed = FileSizeConversions.SizeSuffix((d.TotalSize - d.TotalFreeSpace))
                }).ToList();
*/
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
