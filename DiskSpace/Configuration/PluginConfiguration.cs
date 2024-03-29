﻿using System.Collections.Generic;
using MediaBrowser.Model.Plugins;

namespace DiskSpace.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public string AvailableColor                        { get; set; }
        public string AvailableOutline                      { get; set; }
        public string UsedColor                             { get; set; }
        public string UsedOutline                           { get; set; }
        public List<MonitoredPartition> MonitoredPartitions { get; set; }
        public List<string> IgnoredPartitions               { get; set; }
        public string DataDisplayRender                     { get; set; }
        public int ChartCutoutPercentage                    { get; set; } = 40;
    }

    public class MonitoredPartition
    {
        public string Name      { get; set; }
        public long Threshold { get; set; }
        public string Alias { get; set; }
    }
}
