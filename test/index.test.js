const path = require('path')
const fs = require('fs')
const { expect } = require('chai')
const webpack = require('webpack')

const entryFilePath = path.join(__dirname, 'source/entry.js')
const outputDirPath = path.join(__dirname, 'build')
const outputFileName = 'build.js'
const outputFilePath = path.join(outputDirPath, outputFileName)

function getTestWebPackConfig(loaderConfig) {
  return {
    mode: 'development',
    devtool: false,
    entry: entryFilePath,
    output: {
      path: outputDirPath,
      filename: outputFileName
    },
    module: {
      rules: [
        loaderConfig
      ]
    }
  }
}

describe('Webpack replace loader ...', () => {
  it('should replace with string search', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          search: 'var value',
          replace: 'var a'
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).to.not.include('var value')
          expect(contents).to.include('var a')
          done()
        })
      }
    )
  })

  it('should replace with pattern search defined as string', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          search: `var VALUE = '.*'`,
          replace: `var a = ''`,
          flags: 'ig'
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).to.not.include('var value')
          expect(contents).to.include(`var a = ''`)
          done()
        })
      }
    )
  })

  it('should replace with pattern search as RegExp', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          search: /var VALUE = '.*'/ig,
          replace: `var a = ''`
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).to.not.include('var value')
          expect(contents).to.include(`var a = ''`)
          done()
        })
      }
    )
  })

  it('should replace scoped', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          search: 'var value',
          replace: 'var a'
        }
      },
      {
        test: /bar\.js$/,
        loader: '__this-loader',
        options: {
          search: 'var value',
          replace: 'var bar'
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).to.not.include('var value')
          expect(contents).to.include('var a')
          expect(contents).to.include('var bar')
          done()
        })
      }
    )
  })

  it('should replace with function replace', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          search: `var value = '(baz)'`,
          replace: (match, p1, offset, string) => `var a = '${p1.toUpperCase()}'`,
          flags: 'g'
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).to.include(`var a = 'BAZ'`)
          done()
        })
      }
    )
  })

  it('should replace using multiple queries', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          multiple: [
            {
              search: 'var value',
              replace: 'var a'
            },
            {
              search: 'module.exports = value',
              replace: 'module.exports = a'
            }
          ]
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).to.not.include('var value')
          expect(contents).to.include('var a')
          expect(contents).to.not.include('module.exports = value')
          expect(contents).to.include('module.exports = a')
          done()
        })
      }
    )
  })

  it('should replace using multiple queries as strings', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        use: [
          {
            loader: '__this-loader',
            options: {
              search: 'var value',
              replace: 'var a'
            }
          },
          {
            loader: '__this-loader',
            options: {
              search: 'module.exports = value',
              replace: 'module.exports = a'
            }
          }
        ]
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).to.not.include('var value')
          expect(contents).to.include('var a')
          expect(contents).to.not.include('module.exports = value')
          expect(contents).to.include('module.exports = a')
          done()
        })
      }
    )
  })

  it('should not throw error when cannot replace in single mode', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          search: 'nonexistent value',
          replace: 'var a'
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.not.include('Replace failed (strict mode) : nonexistent value → var a')
          done()
        })
      }
    )
  })

  it('should not throw error when cannot replace in multiple mode', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          multiple: [
            {
              search: 'nonexistent value',
              replace: 'var a'
            }
          ]
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).to.not.include('Replace failed (strict mode) : nonexistent value → var a')
          done()
        })
      }
    )
  })

  it('should throw error when cannot replace in single strict mode', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          search: 'nonexistent value',
          replace: 'var a',
          strict: true
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).to.include('Replace failed (strict mode) : nonexistent value → var a')
          done()
        })
      }
    )
  })

  it('should throw error when can not replace in multiple strict mode', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          multiple: [
            {
              search: 'nonexistent value',
              replace: 'var a',
              strict: true
            }
          ]
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).to.include('Replace failed (strict mode) : nonexistent value → var a')
          done()
        })
      }
    )
  })

  it('should throw error when search is not defined in strict mode', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          multiple: [
            {
              replace: 'var a',
              strict: true
            }
          ]
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).to.include('Replace failed (strict mode) : options.search and options.replace are required')
          done()
        })
      }
    )
  })

  it('should replace only one occurrence', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          search: 'abcd',
          replace: 'efhg'
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents.match(/abcd/g)).to.have.lengthOf(1);
          expect(contents.match(/efhg/g)).to.have.lengthOf(1);
          done()
        })
      }
    )
  })

  it('should replace all occurrences', done => {
    webpack(getTestWebPackConfig(
      {
        test: /\.js$/,
        loader: '__this-loader',
        options: {
          search: 'abcd',
          replace: 'efgh',
          replaceAll: true
        }
      }),
      (error, stats) => {
        expect(error).to.equal(null)

        fs.readFile(outputFilePath, 'utf8', (error, contents) => {
          expect(error).to.equal(null)
          expect(contents).to.be.a('string')
          expect(contents).not.to.include('abcd')
          expect(contents.match(/efgh/g)).to.have.lengthOf(2);
          done()
        })
      }
    )
  })
})
