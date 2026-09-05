export function listMemberPayments({ paymentRepository }) {
  return function execute(memberId) {
    return paymentRepository.findByMember(memberId)
  }
}
