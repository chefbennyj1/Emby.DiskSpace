using System;
using System.Collections.Generic;
using System.Text;
using MediaBrowser.Model.Plugins;

namespace DiskSpace.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public string AvailableColor { get; set; }
        public string AvailableOutline { get; set; }
        public string UsedColor { get; set; }
        public string UsedOutline { get; set; }

    }
}
