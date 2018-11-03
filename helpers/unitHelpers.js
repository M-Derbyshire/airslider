//helpers to create relative positioning/sizings
//they give you 1000 units (both ways) to play with
function xUnit(unit)
{
    return (kernel.graphicEn.gameCan.width / 1000) * unit;
}
function yUnit(unit)
{
    return (kernel.graphicEn.gameCan.height / 1000) * unit;
}
function zUnit(unit)
{
    return -((kernel.graphicEn.gameCan.height / 1000) * unit);
}