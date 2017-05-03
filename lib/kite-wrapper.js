'use strict'

const os = require('os')
const element = require('./decorators/element')
const include = require('./decorators/include')
const {EventsDelegation} = require('atom-utils')
const {CompositeDisposable} = require('atom')
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
    return path && /\.py$/.test(path) && os.platform() !== 'linux' && !atom.packages.getLoadedPackage('kite')
  }

  static handle (textEditor, minimapElement) {
    let wrapper = new this()
    wrapper.textEditor = textEditor
    wrapper.minimap = minimapElement.getModel()
    wrapper.minimapElement = minimapElement
    wrapper.wrap(minimapElement)
  }

  destroy () {
    this.subscriptions.dispose()
    this.observer.disconnect()
    delete this.minimap
    delete this.minimapElement
    delete this.textEditor
    this.remove()
  }

  unwrap () {
    this.parentNode.insertBefore(this.minimapElement, this)
    this.destroy()
  }

  wrap (minimapElement) {
    minimapElement.parentNode.insertBefore(this, minimapElement)

    this.content = document.createElement('div')
    this.appendChild(minimapElement)
    this.appendChild(this.content)

    this.observer = new window.MutationObserver(() => {
      this.style.cssText = minimapElement.style.cssText
      this.className = minimapElement.className
    })

    this.observer.observe(minimapElement, {attributes: true})

    this.minimap.getScreenHeight = function () {
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

    this.update()
  }

  update () {
    let matches = []
    this.textEditor.scan(/(import|from)\s+(([\w]+(,\s)*)+)/g, (m) => {
      matches = matches.concat(m.match[2].split(/,\s/g))
    })
    const links = modules.filter(m => matches.includes(m)).slice(0, 5).map(this.link)

    this.content.innerHTML = this.snippet(links.join(''))
  }

  snippet (content) {
    return `
      <i class="icon icon-remove-close"></i>
      <span class="collapser">docs <i class="icon icon-chevron-down"></i></span>
      <ul>${content}</ul>
    `
  }

  link (mod) {
    return `<li><a href="https://kite.com/docs/python/${mod}?source=minimap">${mod}</a></li>`
  }

  attachedCallback () {
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.textEditor.onDidStopChanging(() => {
      this.update()
    }))

    this.subscriptions.add(this.minimap.onDidDestroy(() => {
      this.destroy()
    }))

    this.subscriptions.add(atom.config.observe('minimap.disablePythonDocLinks', (v) => {
      if (v) { this.unwrap() }
    }))

    this.subscriptions.add(this.subscribeTo(this, '.collapser', {
      'click': () => {
        this.querySelector('.collapser').classList.toggle('collapse')
      }
    }))

    this.subscriptions.add(this.subscribeTo(this, '.icon-remove-close', {
      'click': () => {
        atom.config.set('minimap.disablePythonDocLinks', true)
      }
    }))
  }
}

module.exports = KiteWrapper.initClass()
