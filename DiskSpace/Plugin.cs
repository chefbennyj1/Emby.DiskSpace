using System;
using System.Collections.Generic;
using System.IO;
using DiskSpace.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Drawing;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;

namespace DiskSpace
{
    public class Plugin : BasePlugin<PluginConfiguration>, IHasThumbImage, IHasWebPages
    {
        public static Plugin Instance { get; set; }
        public ImageFormat ThumbImageFormat => ImageFormat.Gif;

        public override Guid Id => new Guid("9ECAAC5F-435E-4C21-B1C0-D99423B68984");
       

        public override string Name => "Disk Space";


        public Stream GetThumbImage()
        {
            var type = GetType();
            return type.Assembly.GetManifestResourceStream(type.Namespace + ".thumb.gif");
        }

        public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer) : base(applicationPaths,
            xmlSerializer)
        {
            Instance = this;
        }

        public IEnumerable<PluginPageInfo> GetPages() => new[]
        {
            new PluginPageInfo
            {
                Name                 = "DiskSpacePluginConfigurationPage",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DiskSpacePluginConfigurationPage.html",
                DisplayName          = "Disk Space",
                EnableInMainMenu     = true,
                
            },
            new PluginPageInfo
            {
                Name = "DiskSpacePluginConfigurationPageJS",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DiskSpacePluginConfigurationPage.js"
            },
            new PluginPageInfo
            {
                Name = "DiskSpacePluginTableConfigurationPage",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DiskSpacePluginTableConfigurationPage.html"
            },
            new PluginPageInfo
            {
                Name = "DiskSpacePluginTableConfigurationPageJS",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DiskSpacePluginTableConfigurationPage.js"
            },
            new PluginPageInfo
            {
                Name = "DiskSpacePluginPolarAreaConfigurationPageJS",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DiskSpacePluginPolarAreaConfigurationPage.js"
            },
            new PluginPageInfo
            {
                Name = "DiskSpacePluginPolarAreaConfigurationPage",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DiskSpacePluginPolarAreaConfigurationPage.html"
            },
            new PluginPageInfo
            {
                Name = "DiskSpacePluginSettingsConfigurationPage",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DiskSpacePluginSettingsConfigurationPage.html"
            },
            new PluginPageInfo
            {
                Name = "DiskSpacePluginSettingsConfigurationPageJS",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DiskSpacePluginSettingsConfigurationPage.js"
            },
            new PluginPageInfo
            {
                Name = "Chart.js",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.Chart.js"
            }
        };
    }
}

