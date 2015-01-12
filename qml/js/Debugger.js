//humanReadableExecutionCode => contain human readable code.
//debugStates => contain all debug states.
//bytesCodeMapping => mapping between humanReadableExecutionCode and bytesCode.
//statesList => ListView

var currentSelectedState = null;
var jumpStartingPoint = null;
function init()
{
	console.log('popopop');
	if (debugStates === undefined)
		return;

	statesSlider.maximumValue = debugStates.length - 1;
	statesSlider.value = 0;
	statesList.model = humanReadableExecutionCode;
	currentSelectedState = 0;
	select(currentSelectedState);
	//displayReturnValue();

	jumpoutbackaction.enabled(false);
	jumpintobackaction.enabled(false);
	jumpintoforwardaction.enabled(false);
	jumpoutforwardaction.enabled(false);
}

function moveSelection(incr)
{
	if (currentSelectedState + incr >= 0)
	{
		if (currentSelectedState + incr < debugStates.length)
			select(currentSelectedState + incr);

		statesSlider.value = currentSelectedState;
	}
}

function select(stateIndex)
{
	var codeLine = codeStr(stateIndex);
	var state = debugStates[stateIndex];
	highlightSelection(codeLine);
	currentSelectedState = stateIndex;
	completeCtxInformation(state);

	if (state.instruction === "JUMP")
		jumpintoforwardaction.enabled(true);
	else
		jumpintoforwardaction.enabled(false);

	if (state.instruction === "JUMPDEST")
		jumpintobackaction.enabled(true);
	else
		jumpintobackaction.enabled(false);
}

function codeStr(stateIndex)
{
	var state = debugStates[stateIndex];
	return bytesCodeMapping.getValue(state.curPC);
}

function highlightSelection(index)
{
	statesList.currentIndex = index;
}

function completeCtxInformation(state)
{
	currentStep.update(state.step);
	mem.update(state.newMemSize + " " + qsTr("words"));
	stepCost.update(state.gasCost);
	gasSpent.update(debugStates[0].gas - state.gas);

	stack.listModel = state.debugStack;
	storage.listModel = state.debugStorage;
	memoryDump.listModel = state.debugMemory;
	callDataDump.listModel = state.debugCallData;
}

function displayReturnValue()
{
	headerReturnList.model = contractCallReturnParameters;
	headerReturnList.update();
}

function stepOutBack()
{
	if (jumpStartingPoint != null)
	{
		select(jumpStartingPoint);
		jumpStartingPoint = null;
		jumpoutbackaction.enabled(false);
		jumpoutforwardaction.enabled(false);
	}
}

function stepIntoBack()
{
	moveSelection(-1);
}

function stepOverBack()
{
	var state = debugStates[currentSelectedState];
	if (state.instruction === "JUMPDEST")
	{
		for (var k = currentSelectedState; k > 0; k--)
		{
			var line = bytesCodeMapping.getValue(debugStates[k].curPC);
			if (line === statesList.currentIndex - 2)
			{
				select(k);
				break;
			}
		}
	}
	else
		moveSelection(-1);
}

function stepOverForward()
{
	var state = debugStates[currentSelectedState];
	if (state.instruction === "JUMP")
	{
		for (var k = currentSelectedState; k < debugStates.length; k++)
		{
			var line = bytesCodeMapping.getValue(debugStates[k].curPC);
			if (line === statesList.currentIndex + 2)
			{
				select(k);
				break;
			}
		}
	}
	else
		moveSelection(1);
}

function stepIntoForward()
{
	var state = debugStates[currentSelectedState];
	if (state.instruction === "JUMP")
	{
		jumpStartingPoint = currentSelectedState;
		moveSelection(1);
		jumpoutbackaction.enabled(true);
		jumpoutforwardaction.enabled(true);
	}
}

function stepOutForward()
{
	if (jumpStartingPoint != null)
	{
		stepOutBack();
		stepOverForward();
		jumpoutbackaction.enabled(false);
		jumpoutforwardaction.enabled(false);
	}
}

function jumpTo(value)
{
	currentSelectedState = value;
	select(currentSelectedState);
}
