export async function listReceptionists({ receptionistRosterReader }) {
  return receptionistRosterReader.findReceptionists()
}
