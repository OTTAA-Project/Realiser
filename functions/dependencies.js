function isDependant(nodeChild, nodeParent, isHeadOf) {
    if (isHeadOf[nodeParent.type]){
        if (isHeadOf[nodeParent.type][nodeChild.type]){
                const [amt, dir] = isHeadOf[nodeParent.type][nodeChild.type].split(':');
                switch(amt){
                    case 'SING':
                        return !nodeParent.children.map(e => e.type).includes(nodeChild.type)
                    case 'MULT':
                        switch(dir){
                            case 'LEFT':
                                return nodeParent.position < nodeChild.position;
                            case 'RIGHT':
                                return nodeParent.position > nodeChild.position;
                            case 'UNID':
                                return (nodeParent.children
                                        .filter(e => e.type === nodeChild.type)
                                        .map(e => e.position - nodeParent.position)
                                        .reduce((sum, e) => sum + e, 0)) //sums the element of the array of relative positions
                                        * (nodeChild.position - nodeParent.position) >= 0; //if relative position is the same as the others in the array, the product will be positive
                            default:
                                return true;
                        }
                    default:
                        return false;
                } 
        } else return false;
    } else return false;
}

module.exports = { isDependant }