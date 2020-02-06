using System.Collections.Generic;
using DiskSpace.Api;
using MediaBrowser.Model.Plugins;

namespace DiskSpace.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public string AvailableColor { get; set; }
        public string AvailableOutline { get; set; }
        public string UsedColor { get; set; }
        public string UsedOutline { get; set; }
        public string Threshold { get; set; }
        public List<string> IgnoredPartitions { get; set; }
        public string DataDisplayRender { get; set; }
    }
}
