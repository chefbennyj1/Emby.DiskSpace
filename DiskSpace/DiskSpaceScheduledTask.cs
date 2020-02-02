using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DiskSpace.Helpers;
using MediaBrowser.Controller.Library;
using MediaBrowser.Controller.Notifications;
using MediaBrowser.Model.Activity;
using MediaBrowser.Model.IO;
using MediaBrowser.Model.Notifications;
using MediaBrowser.Model.Tasks;

namespace DiskSpace
{
    public class DiskSpaceScheduledTask : IScheduledTask, IConfigurableScheduledTask
    {
        private IActivityManager ActivityManager { get; set; }
        private INotificationManager NotificationManager { get; set; }
        private INotificationService NotificationService { get; set; }
        private IFileSystem FileSystem { get; set; }
        private IUserManager UserManager { get; set; }
        public DiskSpaceScheduledTask(INotificationManager nM, IFileSystem fS, IUserManager uM, IActivityManager aM)
        {
            NotificationManager = nM;
            FileSystem = fS;
            UserManager = uM;
            ActivityManager = aM;
            
        }
        public async Task Execute(CancellationToken cancellationToken, IProgress<double> progress)
        {
            var step = 100.0 / FileSystem.GetDrives().Count;
            foreach (var fileSystemMetadata in FileSystem.GetDrives())
            {
                try
                {
                    if (fileSystemMetadata.Name.Substring(1, 2).Equals(":\\") && fileSystemMetadata.Name.Split('\\').Length > 2) continue; //Windows
                }
                catch { }

                try
                {
                    switch (fileSystemMetadata.Name.Split('/')[1]) //Ignore these mount types in Linux that get returned from the Emby API
                    {
                        case "etc": case "dev": case "run": case "snap": case "sys": case "proc": continue;
                    }
                }
                catch { }

                var driveInfo = new DriveInfo(fileSystemMetadata.Name);

                progress.Report(step - 1);

                var config = Plugin.Instance.Configuration;
                var friendlyName = driveInfo.Name.Replace(@":\", "").Replace("/", "");

                if (config.IgnoredPartitions != null)
                {
                    if (config.IgnoredPartitions.Exists(d => d == friendlyName)) continue;
                }

                if (driveInfo.TotalSize <= 0) continue; //this drive is too small to be listed
                
                var freeSpace = Math.Round(driveInfo.AvailableFreeSpace / 1000000000.0);
                
                var threshold = 10.0;
                if (config.Threshold != null)
                {
                    threshold = Convert.ToDouble(config.Threshold);
                }

                if (freeSpace > threshold) continue;

                var request = new NotificationRequest()
                {
                    Date = DateTime.Now,
                    Description = $" {driveInfo.Name} ({driveInfo.VolumeLabel}) disk space almost full - {FileSizeConversions.SizeSuffix(driveInfo.AvailableFreeSpace)}",
                    Level = NotificationLevel.Warning,
                    Name = "Disk space almost full",
                    NotificationType = "DiskSpaceAlmostFull",
                    SendToUserMode = SendToUserType.Admins,
                    Url = "",
                    UserIds = UserManager.Users.Where(i => i.Policy.IsAdministrator).Select(i => i.InternalId).ToArray()
                };
                
                await NotificationManager.SendNotification(request, CancellationToken.None);
            }

            progress.Report(100.0);

        }
        
        public IEnumerable<TaskTriggerInfo> GetDefaultTriggers()
        {
            return new[]
            {
                
                new TaskTriggerInfo
                {
                    Type = TaskTriggerInfo.TriggerInterval,
                    IntervalTicks = TimeSpan.FromHours(1).Ticks
                },
                new TaskTriggerInfo()
                {
                    SystemEvent = SystemEvent.WakeFromSleep,
                    Type = TaskTriggerInfo.TriggerSystemEvent
                }
            };
        }

        public string Name => "Disk Space Almost Full Notification";
        public string Key => "Disk Space";
        public string Description => "Notify Admin Accounts about full disk partitions.";
        public string Category => "Disk Space";
        public bool IsHidden => false;
        public bool IsEnabled => true;
        public bool IsLogged => true;
    }
}
