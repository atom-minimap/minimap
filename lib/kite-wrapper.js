'use strict'

const element = require('./decorators/element')
const include = require('./decorators/include')
const {EventsDelegation} = require('atom-utils')
const modules = [
  'os', 'time', 're', 'sys', 'datetime', 'random', 'django', 'json', 'urllib',
  'subprocess', 'math', 'urllib2', 'logging', 'numpy', 'threading', 'shutil',
  'hashlib', 'socket', 'collections', 'copy', 'itertools', 'traceback',
  'tempfile', 'xml', 'urlparse', 'struct', 'flask', 'StringIO', 'string',
  'optparse', 'base64', 'glob', 'csv', 'requests', 'argparse', 'functools',
  'google', 'pickle', 'ConfigParser', 'matplotlib', 'simplejson', 'south',
  'uuid', 'inspect', 'sqlite3', 'cStringIO', 'operator', 'scipy', 'codecs',
  'unittest', 'pygame', 'cgi', 'getopt', 'cPickle', 'httplib', 'pprint',
  'email', 'BeautifulSoup', 'warnings', 'PIL', 'lxml', 'gtk', 'zipfile',
  'sqlalchemy', 'PyQt4', 'multiprocessing', 'smtplib', 'Queue', 'yaml',
  'twisted', 'MySQLdb', 'select', 'getpass', 'gzip', 'imp', 'ctypes',
  'platform', 'mock', 'wx', 'fnmatch', 'mimetypes', 'fabric', 'signal',
  'pymongo', 'io', 'binascii', 'nose', 'decimal', 'pylab', 'shlex', 'commands',
  'distutils', 'textwrap', 'zlib', 'md5', 'serial', 'calendar', 'hmac',
  'jinja2', 'array', 'fcntl', 'thread', 'unicodedata', 'webbrowser',
  'dateutil', 'werkzeug', 'sublime', 'bottle', 'locale', 'pkg_resources',
  'cookielib', 'gobject', 'feedparser', 'tarfile', 'web', 'nltk', 'httplib2',
  'markdown', 'xmlrpclib', 'boto', 'zope', 'redis', 'heapq', 'ast', 'pdb',
  'Tkinter', 'bisect', 'tornado', 'weakref', 'pyramid', 'psycopg2', 'Crypto',
  'difflib', 'gc', 'HTMLParser', 'gi', 'pwd', 'doctest', 'gevent', 'atexit',
  'gettext', 'networkx', 'curses', 'contextlib', 'pandas', 'exceptions',
  'stat', 'bson', 'pytz', 'sklearn', 'importlib', 'dbus', 'BaseHTTPServer',
  'pygments', 'docutils', 'selenium', 'oauth2', 'twitter', 'scrapy', 'ssl',
  'mako', 'cherrypy', 'shelve', 'paramiko', 'tweepy', 'mechanize', 'types',
  'rospy', 'cv2', 'PySide', 'parser', 'pytest', 'celery', 'posixpath', 'sha',
  'tkFileDialog', 'asyncore', 'tkMessageBox', 'xlrd', 'webob', 'win32api',
  'SocketServer', 'fileinput', 'cv', 'transaction', 'game', 'setuptools',
  'Cookie', 'tests', 'plone', 'xbmcgui', 'code', 'pycurl', 'bz2', 'ftplib',
  'IPython', 'ImageDraw', 'zmq'
]

class KiteWrapper {
  static initClass () {
    include(this, EventsDelegation)
    return element(this, 'kite-minimap-wrapper')
  }

  static isLegible (textEditor) {
    const path = textEditor.getPath()
    return path && /\.py$/.test(path) && !atom.packages.getLoadedPackage('kite')
  }

  static handle (textEditor, minimapElement) {
    const matches = []
    textEditor.scan(/(import|from)\s+(\w+)/g, (m) => {
      matches.push(m.match[2])
    })
    const links = modules.filter(m => matches.includes(m)).slice(0, 5).map(this.link)

    let wrapper = new this()
    wrapper.wrap(minimapElement, this.snippet(links.join('')))
  }

  static snippet (content) {
    return `
      <span class="collapser">docs <i class="icon icon-chevron-down"></i></span>
      <ul>${content}</ul>
    `
  }

  static link (mod) {
    return `<li><a href="https://alpha.kite.com/docs/python/${mod}?source=minimap">${mod}</a></li>`
  }

  wrap (minimapElement, html) {
    minimapElement.parentNode.insertBefore(this, minimapElement)

    const content = document.createElement('div')
    content.innerHTML = html
    this.appendChild(minimapElement)
    this.appendChild(content)

    this.observer = new window.MutationObserver(() => {
      this.style.cssText = minimapElement.style.cssText
      this.className = minimapElement.className
    })

    this.observer.observe(minimapElement, {attributes: true})

    const minimap = minimapElement.getModel()
    minimap.getScreenHeight = function () {
      if (this.isStandAlone()) {
        if (this.height != null) {
          return this.height
        } else {
          return this.getHeight()
        }
      } else {
        return minimapElement.clientHeight
      }
    }
  }

  attachedCallback () {
    this.subscription = this.subscribeTo(this, '.collapser', {
      'click': () => {
        this.querySelector('.collapser').classList.toggle('collapse')
      }
    })
  }

  detachedCallback () {
    this.subscription.dispose()
    this.observer.disconnect()
  }
}

module.exports = KiteWrapper.initClass()
