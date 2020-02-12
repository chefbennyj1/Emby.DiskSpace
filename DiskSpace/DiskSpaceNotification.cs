using System.Collections.Generic;
using MediaBrowser.Controller.Notifications;
using MediaBrowser.Model.Notifications;

namespace DiskSpace
{
    public class DiskSpaceNotification : INotificationTypeFactory
    {
        public IEnumerable<NotificationTypeInfo> GetNotificationTypes()
        {
           return new List<NotificationTypeInfo>
            {
                new NotificationTypeInfo
                {
                    Type               = "DiskSpaceAlmostFull",
                    Name               = "Disk Space Almost Full",
                    Category           = "Disk Space",
                    Enabled            = true,
                    IsBasedOnUserEvent = false
                }
            };
           
        }
    }
    
}
