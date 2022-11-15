const expect = require('chai').expect

describe('Test Dependencies', () => {
    before(() => {
        this.isDependant = require('../dependencies.js').isDependant;
        this.isHeadOf = {
            "PARENT": {
                "CHILD_SING": "SING:",
                "CHILD_MULT": "MULT:",
                "CHILD_MULT_UNID": "MULT:UNID",
                "CHILD_MULT_LEFT": "MULT:LEFT",
                "CHILD_MULT_RIGHT": "MULT:RIGHT"
            }
        }
    })

    it('Should only get one dependant if SING', () => {
        const child = {type: 'CHILD_SING', position: 0, children: []}
        const parent = {type: 'PARENT', position: 1, children: []}

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //add a children with the same name
        parent.children.push({type: 'CHILD_SING', position: 2})

        expect(this.isDependant(child, parent, this.isHeadOf)).false
    })
    
    it('Should get many dependants if MULT', () => {
        const child = {type: 'CHILD_MULT', position: 0, children: []}
        const parent = {type: 'PARENT', position: 1, children: []}

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //add a children with the same name
        parent.children.push({type: 'CHILD_MULT', position: 2})

        expect(this.isDependant(child, parent, this.isHeadOf)).true
    })

    it('Should only get dependants on one side if MULT:UNID', () => {
        const child = {type: 'CHILD_MULT_UNID', position: 0, children: []}
        const parent = {type: 'PARENT', position: 2, children: []}

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //add a children with the same name on the same direction
        parent.children.push({type: 'CHILD_MULT_UNID', position: 1})

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //clear children
        parent.children.length = 0
        //add a children with the same name on a different direction
        parent.children.push({type: 'CHILD_MULT_UNID', position: 3})

        expect(this.isDependant(child, parent, this.isHeadOf)).false
    })

    it('Should only get dependants on the left if MULT:RIGHT (because RIGHT refers to the position of the HEAD)', () => {
        const child = {type: 'CHILD_MULT_RIGHT', position: 0, children: []}
        const parent = {type: 'PARENT', position: 2, children: []}

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //add a children with the same name to the left
        parent.children.push({type: 'CHILD_MULT_RIGHT', position: 1})

        expect(this.isDependant(child, parent, this.isHeadOf)).true

        //change child position to the right
        child.position = 3
        expect(this.isDependant(child, parent, this.isHeadOf)).false
    })

    it('Should only get dependants on the left if MULT:LEFT (because RIGHT refers to the position of the HEAD)', () => {
        const child = {type: 'CHILD_MULT_LEFT', position: 2, children: []}
        const parent = {type: 'PARENT', position: 1, children: []}

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //add a children with the same name to the right
        parent.children.push({type: 'CHILD_LEFT', position: 3})

        expect(this.isDependant(child, parent, this.isHeadOf)).true

        //change child position to the left
        child.position = 0
        expect(this.isDependant(child, parent, this.isHeadOf)).false
    })
})