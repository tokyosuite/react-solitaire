
/*
 * These tests use the shallow renderer, which is faster and doesn't require an emulated DOM
 */

const Unexpected = require('unexpected');
const UnexpectedReact = require('unexpected-react');

var React = require('react');
var TestUtils = require('react-addons-test-utils');

const Table = require('../components/Table/').default;

const expect = Unexpected.clone()
    .use(UnexpectedReact);

const deck = (function() {
  // deck only generates once
  let memo = [];
  let initDeck = () => {
    if (memo.length)
      return memo;

    const suits = ['hearts', 'diamonds', 'clubs', 'spades']
    const values = ['two', 'three', 'four', 'five', 'six', 'seven',
                  'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'ace']
    suits.forEach((suit) => {
      values.forEach((value) => {
        let str = value + '-of-' + suit;
        memo.push({name: str, location: 'TABLE', flipped: true});
      })
    })
    return memo;
  }
  return initDeck();
})()
describe('Table', () => {
    let renderer;

    beforeEach(() => {
        renderer = TestUtils.createRenderer();
        renderer.render(<Table dragdrop={ {isDragging: false} }
                               cards={ deck }
                               beginDrag={function() {}}
                               endDrag={function() {}}
                               moveCard={function() {}} />);
    });

    it('should be a function', () => {
        return expect(Table, 'to be a', 'function');
    });
    it('should render a ReactElement', () => {
        let result = renderer.getRenderOutput();
        return expect(TestUtils.isElement(result), 'to be ok');
    });
    it('should have an array of 52 cards', () => {
        let result = renderer.getRenderOutput();
        let { children } = result.props;
        let cardsArr = [];
        children.forEach((child) => {
            let childrenObjects = Object.keys(child).reduce((memo, current) => {
                let grandChild = child[current];
                if (typeof grandChild === 'object' && grandChild !== null) {
                    memo.push(grandChild);
                }
                return memo;
            }, []);
            // All cards have keys of the form 'value-of-suit', eg 'two-of-hearts'
            if (childrenObjects.length > 0) {
                let { key } = childrenObjects[0];
                if (key) {
                  if (/.*-of-.*/.test(key))
                      cardsArr = child; 
                }
            }
        });
        return expect(cardsArr, 'to have length', 52);
    });
    it('should render 52 cards', () => {
        let result = renderer.getRenderOutput();
        let { children } = renderer.getRenderOutput().props;
        let count = 0;
        function deepCheckForCardAndCount(elem) {
            function checkForCardAndCount(elem) {
                if (elem && elem.type) {
                    let fnName = elem.type.toString().split('\n')[0];
                    if (fnName.indexOf('Card') >= 0)
                      ++count;
                }
            }
            if (Array.isArray(elem))
                elem.forEach(checkForCardAndCount);
            else
                checkForCardAndCount(elem);
        }
        children.forEach(deepCheckForCardAndCount);

        return expect(count, 'to be', 52); 
    });
});