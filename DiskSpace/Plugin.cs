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
        public ImageFormat ThumbImageFormat => ImageFormat.Jpg;

        private readonly Guid _id = new Guid("9ECAAC5F-435E-4C21-B1C0-D99423B68984");
        public override Guid Id => _id;

        public override string Name => "Disk Space";


        public Stream GetThumbImage()
        {
            var type = GetType();
            return type.Assembly.GetManifestResourceStream(type.Namespace + ".thumb.jpg");
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
                Name = "Chart.bundle.js",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.Chart.bundle.js"
            }
        };
    }
}

