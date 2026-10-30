// src/content/settings.js — single-record CMS settings.
// Values are stored as JSON in site_settings.setting_value.

const f = (name, type, label, opts = {}) => ({ name, type, label, ...opts });

const settings = {
  site: {
    label: 'Site identity & social', roles: ['Administrator', 'Publisher'],
    fields: [
      f('name', 'bi', 'Department name', { required: true }),
      f('shortName', 'text', 'Short name', { max: 20 }),
      f('gov', 'bi', 'Government line'),
      f('tagline', 'bi', 'Tagline'),
      f('logo', 'image', 'Header logo (Government of AP emblem)'),
      f('domain', 'url', 'Website address'),
      f('ctaLabel', 'bi', 'Header button label'),
      f('footerAbout', 'bitext', 'Footer description'),
      f('social', 'repeater', 'Social media', { fields: [f('id', 'select', 'Network', { options: ['facebook', 'x', 'youtube', 'instagram', 'linkedin'] }), f('label', 'text', 'Label'), f('href', 'url', 'Profile URL', { required: true })] })
    ]
  },
  contact: {
    label: 'Contact details', roles: ['Administrator', 'Publisher'],
    fields: [
      f('headOffice', 'bitext', 'Head office address'),
      f('phone', 'text', 'Phone', { max: 40 }),
      f('fax', 'text', 'Fax', { max: 40 }),
      f('email', 'email', 'Email'),
      f('workingHours', 'bi', 'Working hours')
    ]
  },
  about: {
    label: 'About the Department', roles: ['Administrator', 'Publisher'],
    fields: [
      f('intro', 'bilist', 'Introduction paragraphs'),
      f('vision', 'bitext', 'Vision'),
      f('mission', 'bitext', 'Mission'),
      f('objectives', 'bilist', 'Objectives'),
      f('orgStructure', 'bitext', 'Organisation structure'),
      f('orgChart', 'image', 'Organisation chart image')
    ]
  },
  investors: {
    label: "Investor's Corner", roles: ['Administrator', 'Publisher'],
    fields: [f('intro', 'bitext', 'Introduction'), f('whyInvest', 'bilist', 'Why invest'), f('steps', 'bilist', 'How to invest – steps')]
  },
  home: {
    label: 'Home page sections', roles: ['Administrator', 'Publisher'],
    fields: [
      f('showTicker', 'bool', 'Latest updates ticker'),
      f('showServices', 'bool', 'Feature cards'),
      f('showAudiences', 'bool', '"What brings you here?"'),
      f('showStats', 'bool', 'Department at a glance'),
      f('showArticles', 'bool', 'News & updates band'),
      f('articlesTitle', 'bi', 'News band title'),
      f('articlesSubtitle', 'bi', 'News band subtitle'),
      f('showDistricts', 'bool', 'District explorer'),
      f('showAlmanac', 'bool', 'Science almanac'),
      f('showStory', 'bool', 'Illustrated story'),
      f('showConnections', 'bool', 'How it all connects'),
      f('showStories', 'bool', 'Science stories'),
      f('showEvents', 'bool', 'Events'),
      f('showGallery', 'bool', 'Photo gallery'),
      f('galleryTitle', 'bi', 'Gallery title'),
      f('galleryTagline', 'bi', 'Gallery tagline (shown under the gallery)')
    ]
  },
  system: {
    label: 'System', roles: ['Administrator'], private: true,
    fields: [f('feedbackNotifyEmail', 'email', 'Send feedback notifications to')]
  }
};

function getSetting(name) {
  return Object.prototype.hasOwnProperty.call(settings, name) ? settings[name] : null;
}

module.exports = { settings, getSetting };
