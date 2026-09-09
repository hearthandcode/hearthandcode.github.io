/// A moved packet cannot be used again by the sender.
///
/// ```compile_fail,E0382
/// struct TaskPacket { id: String }
/// fn handoff(_packet: TaskPacket) {}
/// let packet = TaskPacket { id: "packet-7".into() };
/// handoff(packet);
/// println!("{}", packet.id);
/// ```
#[allow(dead_code)]
fn moved_packet_is_unavailable() {}

struct TaskPacket {
    id: String,
    payload: String,
}

struct CompletedPacket {
    id: String,
    payload: String,
}

fn handoff(packet: TaskPacket) -> CompletedPacket {
    CompletedPacket { id: packet.id, payload: packet.payload }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn handoff_preserves_packet_data() {
        let packet = TaskPacket { id: "packet-7".into(), payload: "bounded work".into() };
        let completed = handoff(packet);
        assert_eq!(completed.id, "packet-7");
        assert_eq!(completed.payload, "bounded work");
    }
}

fn main() {
    let packet = TaskPacket { id: "packet-7".into(), payload: "bounded work".into() };
    let completed = handoff(packet);
    println!("{}:{}", completed.id, completed.payload);
}
